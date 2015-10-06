angular.module('services')
    .factory('mqttService', function($rootScope, $log, $http, $sessionStorage) {

        var QOS_AT_MOST_ONCE = 0;
        var QOS_AT_LEAST_ONCE = 1;
        var QOS_EXACTLY_ONCE = 2;

    	var mqttService = {
    		client: null,
    		username: null,
    		host: null,
    		port: null,
    		useSSL: false,

    		connect: function() {
    			$log.debug("CONNECTING...");

    			mqttService.username = $sessionStorage.username;
    			mqttService.host = $sessionStorage.host;
    			mqttService.port = Number($sessionStorage.port);
    			mqttService.useSSL = $sessionStorage.useSSL ? $sessionStorage.useSSL : false;

    			mqttService.client = new Paho.MQTT.Client(mqttService.host, mqttService.port, mqttService.username);

                mqttService.client.onConnectionLost = mqttService.onConnectionLost;
                mqttService.client.onMessageArrived = mqttService.onMessageArrived;

	            var willMsg = new Paho.MQTT.Message(angular.toJson({type:"status", clientId: mqttService.username, status: "offline" }));
	            willMsg.qos = QOS_EXACTLY_ONCE;
	            willMsg.destinationName = "users/" + mqttService.username + "/status";
	            willMsg.retained = true;

                var options = {
                    timeout: 5,
                    keepAliveInterval: 120,
                    cleanSession: true,
                    useSSL: mqttService.useSSL,
                    willMessage: willMsg,
                    onSuccess: mqttService.onConnect,
                    onFailure: mqttService.onFail
                };

                mqttService.client.startTrace();

                mqttService.client.connect(options);
    		},

    		onConnect: function() {
				$log.debug("CONNECTION SUCCESS");
				$rootScope.$broadcast( "connected", true );

				mqttService.client.subscribe("users/+/status", {qos: QOS_AT_LEAST_ONCE});

				var payload = {
					type: "status",
					clientId: mqttService.username,
					status: "available"
				}

                var payloadString = angular.toJson(payload);

                var message = new Paho.MQTT.Message(payloadString);
                message.destinationName = "users/" + mqttService.username + "/status";
                message.qos = QOS_AT_LEAST_ONCE;
                message.retained = true;

                $log.debug("SEND TOPIC: " + message.destinationName + " QoS: " + message.qos + " Retain: " + message.retained + " message: " + payloadString);

                mqttService.client.send(message);
    		},

    		onFail: function() {
    			$log.debug("CONNECTION FAILED");
    		},

    		onConnectionLost: function() {
    			$log.debug("CONNECTION LOST");
    			$rootScope.$broadcast( "disconnected", true );

    			var traceLog = mqttService.client.getTraceLog();

    			angular.forEach(traceLog, function(traceLine) {
    				$log.debug(traceLine);	
    			})
    			
    			mqttService.client.stopTrace();
    		},

    		onMessageArrived: function(message) {
                $log.debug("MESSAGE ARRIVED ON TOPIC: " + message.destinationName + " RETAINED: " + message.retained);

                if (message.payloadString) {
                    var payload = angular.fromJson(message.payloadString);

                    if(payload.type == "status") {
                    	$log.debug(payload);
                    	$rootScope.$broadcast( "statusUpdate", payload);
                    }
                }
    		},

    		isConnected: function() {
    			if(mqttService.client) {
    				return mqttService.client.isConnected();
    			}
    			return false;
    		}
    	}

    	return mqttService;
    });
