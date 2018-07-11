"use strict";

        
        var dappAddress = "n1wB1jZgT9HmXKCto8WA5iJKcTpUkhVQFsu";
        var nebulas = require("nebulas"),
            Account = nebulas.Account,
            neb = new nebulas.Neb();
        //neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
        neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

        var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
        var nebPay = new NebPay();
        var serialNumber

        var intervalQuery


        $(function(){
            WalletCheck();
            Ranking();
        })

        $(document).on('click',".save",function(){
                if(win==1){
                var to = dappAddress;
                var value = "0";
                var callFunction = "save"
                var callArgs = "[\"" + $(".step").html() + "\"]"

                serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
                    //callback: NebPay.config.testnetUrl, //测试网
                    listener: cbPush        //设置listener, 处理交易返回信息
                });

                intervalQuery = setInterval(function () {
                    funcIntervalQuery();
                }, 10000);
            }
        });

        function WalletCheck(){
            if (typeof (webExtensionWallet) === "undefined") {
                $(".WalletCheck").show();
            }

        }
        //排行榜
        function Ranking() {
            var from = Account.NewAccount().getAddressString();
            var value = "0";
            var nonce = "0"
            var gas_price = "1000000"
            var gas_limit = "2000000"
            var callFunction = "getAll";
            var callArgs = "[]"; //in the form of ["args"]
            var contract = {
                "function": callFunction,
                "args": callArgs
            }

            neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
                RankingInfo(resp)
            }).catch(function (err) {
                console.log("error:" + err.message)
            })

        }
        //return of search,
        function RankingInfo(resp) {
            var result = resp.result    ////resp is an object, resp.result is a JSON string
            result = JSON.parse(result);
            //var result=[{"from":"aaa","step":"2"},{"from":"b","step":"8"},{"from":"c","step":"6"}]
            result.sort(up);
            console.log(result);
            var _html="";
            $.each(result,function(i){
                _html +='<section class="box">';
                _html +=' <section class="col_1" title="'+(i+1)+'">'+(i+1)+'</section>';
                // _html +='<section class="col_2"></section>';
                _html +='<section class="col_3">'+this.from+'</section>';
                _html +='<section class="col_4">'+this.step+'</section>';
                _html +='</section>';
                });
            $("#ranking_list").html(_html);
        }

        function up(x,y){
            return x.step-y.step;
        }

        function funcIntervalQuery() {
            nebPay.queryPayInfo(serialNumber,{         //search transaction result from server (result upload to server by app)
                }).then(function (resp) {
                    console.log("tx result: " + resp)   //resp is a JSON string
                    var respObject = JSON.parse(resp)
                    if (respObject.code === 0) {
                        alert("上榜成功")
                        clearInterval(intervalQuery)
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
        }

        function cbPush(resp) {
            console.log("response of push: " + JSON.stringify(resp))
        }
