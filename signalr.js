module.exports = function (RED) {


    function signalRNode(config) {

        RED.nodes.createNode(this, config);
        console.log(JSON.stringify(config));

        var node = this;
        console.log(config.uri);
        const signalR = require("@aspnet/signalr");
        var hubConnection;

        setupSignalR();
        node.on('input', function (msg) {

            hubConnection.invoke("newMessage", msg.payload).then(() => {
                node.send(msg);
            });

        });

        function setupSignalR() {
  
            (function connect() {

                function reconnect() {

                    setTimeout(connect, 3000);
                }

                hubConnection = new signalR.HubConnectionBuilder()
                    .withUrl(config.uri)
                    .build();

                hubConnection.start()
                    .then(() => {

                        node.status({ fill: "green", shape: "dot", text: "connected" });
                        node.send("started!");
                    }).catch(err => reconnect());

                hubConnection.onclose(async () => {
                    node.status({ fill: "red", shape: "dot", text: "disconnected" });
                    reconnect();
                });

            }());

        }
    }
    RED.nodes.registerType("signalr", signalRNode);
}