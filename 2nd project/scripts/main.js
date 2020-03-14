$(function(){
    $('#wait').show();// show loading div while waiting to ajax call
    getCoinsData();// call for 100 new random coins cards.
    savedCoins();// display chosen coins from user local storage on return to page
});
function getCoinsData() {//creates coins cards on opening page
    jQuery.ajax({
        type: "get",
        url: 'https://api.coingecko.com/api/v3/coins/list',
        dataType: "json",
        success: function (data) {
            let cardHtml = '';
            data.sort(function (a, b) {
                return 0.5 - Math.random();
            });// gives the data array with new random placement of object
            for(let i=0;i<100;i++){
                let symbolStr = data[i].symbol;
                let symbolCAP = symbolStr.toUpperCase();// creat a only capital letters string to symbol name
                cardHtml += `
                <div class="col-sm-4 col-12">
                    <div class="card border-success mb-3" style="max-width: 20rem;">
                        <div class="card-header">
                            <div class="row cardHeader">
                                <div class="col-9">
                                    ${symbolCAP}
                                </div>
                                <div class="col-3">
                                    <div class="form-group">
                                        <div class="custom-control custom-switch">
                                            <input type="checkbox" class="custom-control-input checkboxSwitch" data-id="${data[i].id}" data-symbol="${symbolCAP}" id="SWITCH${data[i].id}">
                                            <label class="custom-control-label" for="SWITCH${data[i].id}"></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" id="${data[i].id}">
                            <h4 class="card-title">${data[i].name}</h4>
                            <p class="card-text"><button data-toggle="collapse" data-target="#collapse${data[i].id}" type="button" onClick="cardInfo('${data[i].id}');" class="btn btn-outline-success">Info</button></p>
                        </div>
                    </div>
                </div>
                `
            };
            $('#wait').hide();// hide loading div
            $('#cardLoad').html(cardHtml);// append all coin cards to html container
        },
        error: function (xhr, ajaxOptions, thrownError) {
            //alert(xhr.status);
            $('#wait').hide();// hide loading div
            alert(thrownError);// show alert if request is not success for some reason
        }
    });
  };
function cardInfo(cardId){// show coin info on button info click
    setStorage(cardId);// saves info button html code
    /* check time diffrenses from last call */
    let TOCstor = sessionStorage.getItem('TOC'+cardId);
    let OIstor = sessionStorage.getItem('OI'+cardId);
    let timeObject = new Date();
    let callTime = timeObject.getTime();
    // console.log(TOCstor+':'+OIstor)
    if(TOCstor!=null){//if not the first call check the time passed
        let timePass = callTime-TOCstor;
        if(timePass<=120000){//if less then 2 minuts pass SHOW LAST CALL info from sessionstorage
            $(function(){
                $("#"+cardId).html(OIstor);
            });
        }else{ajaxCallCardInfo(cardId,callTime);}//if more then 2 minuts pass GETS NEW info from api
    }else{ajaxCallCardInfo(cardId,callTime);}
    /* ajax call for new coin info */
    function ajaxCallCardInfo(cardId,callTime){
        $('#wait').show();
        jQuery.ajax({
            type: "get",
            url: 'https://api.coingecko.com/api/v3/coins/' + cardId,
            dataType: "json",
            success: function (data) {
                let symbolStr = data.symbol;
                let symbolCAP = symbolStr.toUpperCase();// creat a only capital letters string to symbol name
                let infoHtml = '';
                    infoHtml += `
                    <h4 class="card-title">${data.name}</h4>
                    <div class="row" id="collapse${data.id}">
                        <div class="col-3">
                            <img class="img-fluid" src="${data.image.small}" alt="Oops">
                        </div>
                        <div class="col-5">
                            <p class="card-text">${data.market_data.current_price.usd}<i class="fa fa-dollar"></i></p>
                            <p class="card-text">${data.market_data.current_price.eur}<i class="fa fa-euro"></i></p>
                            <p class="card-text">${data.market_data.current_price.ils}<i class="fa fa-ils"></i></p>
                        </div>
                        <div class="col-4">
                            <button type="button" onClick="hideCardInfo('${data.id}')" class="btn btn-sm btn-outline-danger">Hide info</button>
                        </div>
                    </div>
                    `;
                    $("#"+data.id).html(infoHtml);// load coin info to card body. used data.id of any card as div's card body id
                    $('#wait').hide();// hide loading div
                    setStorageTime(callTime,infoHtml,cardId)//set sessionstorage for ajax data and call time
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //alert(xhr.status);
                $('#wait').hide();// hide loading div
                alert(thrownError);// show alert if request is not success for some reason
            }
        });
    }
};
function hideCardInfo(cardId){// turn the chosen card body html back (with info butten)
    $(function(){
        let storageString = sessionStorage.getItem(cardId);
        $("#"+cardId).html(storageString);
        sessionStorage.removeItem(cardId);
    });
};
function setStorage(cardId){//sets in storage the innerhtml of chosen cardbody to show info
    $(function(){
        let cardInfoBtn = $("#"+cardId).html();
        sessionStorage.setItem(cardId , cardInfoBtn);
    });
};
function setStorageTime(callTime,infoHtml,cardId){//sets 2 storage items:TOC and OI (time and infoHTML)
    $(function(){
        sessionStorage.setItem('TOC'+cardId , callTime);//TOC=time of call
        sessionStorage.setItem('OI'+cardId , infoHtml);//OI=old info
    });
};
/* checkbox (SWITCH) control, saving coins to live reports */
$(function(){
    var switchArr = {coinSym:[],coinSwId:[],coinDataId:[]};// obj of coin data from picked card
    if(localStorage.getItem('chosenCoins')!=null){
        let switchArrJson = JSON.parse(localStorage.getItem('chosenCoins'));
        switchArr = switchArrJson
    };
    $(document).on('click', '.checkboxSwitch', function() {
        /* the ONLY 5 PICK control */
        if(this.checked) {// if check box checked (true) when use switch
            let dataId = $(this).attr('data-id');
            let symbol = $(this).attr('data-symbol');
            let switchId = $(this).attr('id');
            if(switchArr.coinSym.length<5||switchArr.coinSwId.length<5){//if user picked less then 6 coins push to array and storage
                switchArr.coinSym.push(symbol);
                switchArr.coinSwId.push(switchId);
                switchArr.coinDataId.push(dataId);
                setStorageChosenCoins(switchArr);
            }else{// if picked more then 5 coins build hidden div for unpick coins
                let switchCardsHtml = '';
                for(let i=0;i<switchArr.coinSym.length;i++){
                    switchCardsHtml += `
                        <div class="col-sm-4 col-12">
                            <div class="card border-success mb-3" style="max-width: 20rem;">
                                <div class="card-header">
                                    <div class="row cardHeader">
                                        <div class="col-9">
                                            ${switchArr.coinSym[i]}
                                        </div>
                                        <div class="col-3">
                                            <div class="form-group">
                                                <div class="custom-control custom-switch">
                                                    <input type="checkbox" class="custom-control-input cSwitchHiddenDiv"  data-symbol="${switchArr.coinSym[i]}" id="hiddenSWITCH${switchArr.coinSwId[i]}">
                                                    <label class="custom-control-label" for="hiddenSWITCH${switchArr.coinSwId[i]}"></label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                };
                $("#liveCards").html(switchCardsHtml);
                for(let j=0;j<switchArr.coinSym.length;j++){//keep choosen coins switch checked on HIDDEN DIV cards view
                    document.getElementById("hiddenSWITCH"+switchArr.coinSwId[j]).checked = true;
                };
                $("#switchCards").show();// shows hidden div to user
                switchArr.coinSym.push(symbol);
                switchArr.coinSwId.push(switchId);
                switchArr.coinDataId.push(dataId);
                setStorageChosenCoins(switchArr);// saves in object the 6th coin pick, in case user want to keep him
            };
        }else{//if user turn back down the switch (.checked = false), remove this coin from object
            let dataId = $(this).attr('data-id');
            if(!this.checked){
                const unCheckedIndices = switchArr.coinDataId.reduce((acc, letter, index) => 
                Object.assign(acc, {[letter]: index}), {})// find his place (key) in object arrays and remove coin datas from obj.
                switchArr.coinSym.splice( unCheckedIndices[dataId], 1 );
                switchArr.coinSwId.splice( unCheckedIndices[dataId], 1 );
                switchArr.coinDataId.splice( unCheckedIndices[dataId], 1 );
                setStorageChosenCoins(switchArr);
            };
        };
    });
    $(document).on('click', '#confirmSwitch', function(){// when user confirm the unpicked coin in hidden div
        let allChosenCardsSW = document.querySelectorAll(".cSwitchHiddenDiv");// get array of all chosen coins from hidden div
        for(let k=0;k<switchArr.coinSym.length;k++){
            if(!allChosenCardsSW[k].checked){// find the coin user unchecked (key = k)
                document.getElementById(switchArr.coinSwId[k]).checked = false;// turn off switch (uncheck) in MAIN coins page.
                switchArr.coinSym.splice( k, 1 );
                switchArr.coinSwId.splice( k, 1 );
                switchArr.coinDataId.splice( k, 1 );// remove pick from object
                $("#switchCards").hide();// hide back hidden div
                setStorageChosenCoins(switchArr);// update object to storage
            };
        };
    });
    $(document).on('click', '#cancelSwitch', function(){// when user want to keep the first 5 coins picks
        document.getElementById(switchArr.coinSwId[5]).checked = false;// turn off switch (uncheck) in MAIN coins page.
        $("#switchCards").hide();// hide back hidden div
        switchArr.coinSym.splice( 5, 1 );
        switchArr.coinSwId.splice( 5, 1 );
        switchArr.coinDataId.splice( 5, 1 );// remove last pick from object
        setStorageChosenCoins(switchArr);// update object to storage
    });
    function setStorageChosenCoins(switchArr){// sets session storage of object.
        let strSwitchArr = JSON.stringify(switchArr);
        localStorage.setItem('chosenCoins',strSwitchArr);
    };
    /* LIVE REPORTS control */
    $(document).on('click', '#navReports', function(){
        chartDataArr = [];//sets chart data off to rest the chart after click on live repots button
        SecondToChart = 0;//same
        clearInterval(chartIntervalHandle);//same (to stop the old interval and start a new one)
        let switchArrJson = JSON.parse(localStorage.getItem('chosenCoins'));// change switcharr string from local storage to JSON arr
        let symStr = '';
        for(let i=0;i<switchArrJson.coinSym.length-1;i++){//create symbols string to put in url
            symStr += `${switchArrJson.coinSym[i]},`;
        };
        symStr += `${switchArrJson.coinSym[switchArrJson.coinSym.length-1]}`;// end string witout ","
        liveChartLoader(symStr,switchArrJson);// load to container the chart with all is logic and data
    });
//global vars for chart control use
    var chartDataArr = [];
    var SecondToChart = 0;
    var chartIntervalHandle;

    async function chartData(symStr){// function return response from 3rd api url + modified symbol string
        $('#wait').show();
        let response = await fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms='+symStr+'&tsyms=USD');
        $('#wait').hide();
        return response.json();
    };
    
    function liveChartLoader(symStr,switchArrJson){// creats the chart by chosen symbols (gets symStr for Api call and switchArrJson to put symbols names in chart header and graph)
        /* option object (from internet) used to put data for the external librery creator to display*/
        var options = {
            exportEnabled: true,
            animationEnabled: true,
            title:{
                text: symStr + " to USD"// for chart title
            },
            axisX: {
                title: "Seconds"
            },
            axisY: {
                title: "Coin Value",
                titleFontColor: "#4F81BC",
                lineColor: "#4F81BC",
                labelFontColor: "#4F81BC",
                tickColor: "#4F81BC",
                includeZero: false
            },
            axisY2: {
                title: "Coins to USD",
                titleFontColor: "#C0504E",
                lineColor: "#C0504E",
                labelFontColor: "#C0504E",
                tickColor: "#C0504E",
                includeZero: false
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: []// all choosen coins data push to here
        };//end of option object
        function toggleDataSeries(e) {// for external librery use
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        };
        switchArrJson.coinSym.forEach(element=>{
            options.data.push({
                type: "spline",
                name: element,
                showInLegend: true,
                xValueFormatString: "#,##0 Seconds",
                yValueFormatString: "#,##0.##### USD",
                dataPoints: []
            });
        });
        chartIntervalHandle = setInterval(function(){// interval to update data to options object evry 2 seconds
            chartData(symStr).then(res=>{// get data from api
                SecondToChart +=2;// use to show the seconds on X axies
                chartDataArr.push({res,SecondToChart});// push data from api and the second of call to chartDataArr (some coins not available in that api)
            })
            .catch(err =>{
                $('#wait').hide();
                alert(err);
            });
            chartDataArr.forEach(CDAelement=>{// loop on api data to display x,y data points in chart(by pushing it to options.data)
                for(let i=0;i<options.data.length;i++){// manipulation to show only the coins that available on 3rd api
                    for(let k=0;k<Object.keys(CDAelement.res).length;k++){// the keys from 3rd api are the symbols
                        if(Object.keys(CDAelement.res)[k]==options.data[i].name){// if symbols from 3rd api and chosen coins(1st,2nd api) are a mach
                            let symbolKey = Object.values(CDAelement.res)[k];// manipulation to gets coin in usd without use is object key (automated api object control)
                            options.data[i].dataPoints.push({ x: CDAelement.SecondToChart,  y: symbolKey.USD });// push the x,y values to options.data[i].dataPoints
                        };
                    };
                };
            });
            $("#mainContainer").CanvasJSChart(options);// external library display the chart
        },2000);// end of interval
    };
/* HOME navigation control */
    $(document).on('click', '#navHome', function(){
        window.location.href='index.html';// like enterin the index.html page again
    });
/* ABOUT navigation control */
    $(document).on('click', '#navAbout', function(){
        clearInterval(chartIntervalHandle);// for case when clicked when display is on live reports view.
        let aboutHtml = `
            <div class="bg-light">
                <div class="container py-5">
                <div class="row h-100 align-items-center py-5">
                    <div class="col-6">
                        <h2 class="display-4">2nd Project</h2>
                        <p class="lead text-muted mb-0">In that project i created a dynamic html page that show information about Cryptocurrencies coins.</p>
                        <p class="lead text-muted"><a href="index.html" class="text-muted"><strong>Back To Home Page</strong></a></p>
                        <h3 class="my-2">Nir Elenhoren</h3>
                        <p class="lead text-muted my-0"><strong>Email: </strong>nirelen4@gmail.com</p>
                        <p class="lead text-muted my-0"><strong>Phone: </strong>+972507907142</p>
                    </div>
                    <div class="col-6 d-block"><img title="Me" src="img/me.jpg" alt="" class="img-fluid"></div>
                </div>
                </div>
            </div>
        `;
        $('#mainContainer').html(aboutHtml);// display the about div in main container
    });
/* SEARCH navigation control */
    $(document).on('click', '#navSearch', function(e){// for large screens
        searchedCardBuilder("#searchInput");
        e.preventDefault()
    });
    $(document).on('click', '#navSearchP', function(){//for small screens
        searchedCardBuilder("#searchInputP");
    });
    function searchedCardBuilder(navId){// display the searched coin (BY SYMBOL) to cardload row div and hide savedcoins row div
        clearInterval(chartIntervalHandle);// for case when clicked when display is on live reports view.
        let searchInputVal = $(navId).val();//gets user input value
        let searchInputValLC = searchInputVal.toLowerCase();// move to lower case (example if input BtC=>btc) this way ill find it any way
        searchInputData().then(res=>{// gets data from api(1st)
            res.forEach(element=>{// loop on data to find the coin by symbol
                let symbolStr = element.symbol;
                if(symbolStr==searchInputValLC){// if symbol from input = symbol in data
                    let symbolCAP = symbolStr.toUpperCase();// creat a only capital letters string to symbol name
                    searchedCardHtml = `
                    <div class="col-sm-4 col-12">
                        <div class="card border-danger mb-3" style="max-width: 20rem;">
                            <div class="card-header">
                                <div class="row cardHeader">
                                    <div class="col-9">
                                        ${symbolCAP}
                                    </div>
                                    <div class="col-3">
                                        <div class="form-group">
                                            <div class="custom-control custom-switch">
                                                <input type="checkbox" class="custom-control-input checkboxSwitch" data-id="${element.id}" data-symbol="${symbolCAP}" id="SWITCH${element.id}">
                                                <label class="custom-control-label" for="SWITCH${element.id}"></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body" id="${element.id}">
                                <h4 class="card-title">${element.name}</h4>
                                <p class="card-text"><button data-toggle="collapse" data-target="#collapse${element.id}" type="button" onClick="cardInfo('${element.id}');" class="btn btn-outline-success">Info</button></p>
                            </div>
                        </div>
                    </div>
                    `;
                }else return false
            });
            $('#savedCards').hide();// hide savedcards row div
            $('#cardLoad').html(searchedCardHtml);// display the searched card in cardload row div
        })
        .catch(err =>{
            $('#wait').hide();
            alert(err);
        });
    };// end of searched card builder function
    async function searchInputData(){// call and return 1st api data 
        $('#wait').show();
        let response = await fetch('https://api.coingecko.com/api/v3/coins/list');
        $('#wait').hide();
        return response.json();
    };
});
/* display saved coins from local storage */
function savedCoins(){
    $('#savedCards').show()// in case clicked HOME when was on searched coin view
    if(localStorage.getItem('chosenCoins')==null){// if user didnt saved any cards, function dosent work
        return false
    }else{
        let switchArrJson = JSON.parse(localStorage.getItem('chosenCoins'));// change switcharr string from local storage to JSON arr
        let savedCoinsHtml = '';
        let savedCardId = switchArrJson.coinDataId;// enter object.coinId to put as string in url (2nd api)
        savedCardId.forEach(SCIelement=>{
            $('#wait').show();
            jQuery.ajax({// create the saved coins cards
                type: "get",
                url: 'https://api.coingecko.com/api/v3/coins/' + SCIelement,
                dataType: "json",
                success: function (data) {
                    console.log(data);
                    let symbolStr = data.symbol;
                    let symbolCAP = symbolStr.toUpperCase();// creat a only capital letters string to symbol name
                        savedCoinsHtml += `
                                <div class="col-sm-4 col-12">
                                <div class="card border-success mb-3" style="max-width: 20rem;">
                                    <div class="card-header">
                                        <div class="row cardHeader">
                                            <div class="col-9">
                                                ${symbolCAP}
                                            </div>
                                            <div class="col-3">
                                                <div class="form-group">
                                                    <div class="custom-control custom-switch">
                                                        <input type="checkbox" class="custom-control-input checkboxSwitch savedCoinsCheckboxSwitch" data-id="${data.id}" data-symbol="${symbolCAP}" id="SWITCH${data.id}">
                                                        <label class="custom-control-label" for="SWITCH${data.id}"></label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body" id="${data.id}">
                                        <h4 class="card-title">${data.name}</h4>
                                        <p class="card-text"><button data-toggle="collapse" data-target="#collapse${data.id}" type="button" onClick="cardInfo('${data.id}')" class="btn btn-outline-success">Info</button></p>
                                    </div>
                                </div>
                            </div>
                        `;
                        let savedCardIdForChecked = data.id
                        $("#savedCards").html(savedCoinsHtml);// load coin info to card body. used data.id of any card as div's card body id
                        savedCoinsCheck();// turn all saved coins cards checkbox to true
                        $('#wait').hide();// hide loading div
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    //alert(xhr.status);
                    $('#wait').hide();// hide loading div
                    alert(thrownError);// show alert if request is not success for some reason
                }
            });
        });
    }
};
function savedCoinsCheck(){// turn all saved coins cards checkbox to true
    let savedCoinsSwitchArr = document.querySelectorAll('.savedCoinsCheckboxSwitch');// gets all the saved cards checkbox inputs
    for(let i=0;i<savedCoinsSwitchArr.length;i++){// switch checkbox input.checked to true
        savedCoinsSwitchArr[i].checked = true;
    };
};

