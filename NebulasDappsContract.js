"use strict";

var NebulasDappsContract = function() {
    LocalContractStorage.defineMapProperty(this, "dapps");
    LocalContractStorage.defineProperty(this, "owner");
    LocalContractStorage.defineProperty(this, "registrationFee");
	LocalContractStorage.defineProperty(this, "balance");
};
NebulasDappsContract.prototype = {
    init: function() {
        this.registrationFee = new BigNumber(0);
        this.balance = new BigNumber(0);
        this.owner = Blockchain.transaction.from;
    },
    register: function(dappID) {
		var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

		if (!dappID || dappID === "") {
			throw new Error("Missing DApp ID");
        }

		if (!/^[a-zA-Z0-9]+$/.test(dappID)) {
            throw new Error("Invalid DApp ID");
        }

		if (value.lt(this.registrationFee)) {
			throw new Error("Registration fee is required.");
		}

		this.dapps.put(dappID, from);
		this.balance = value.plus(this.balance);
		return dappID;
    },
    checkRegistration: function(dappID) {
		return this.dapps.get(dappID);
    },
    updateFee: function(fee) {
        var from = Blockchain.transaction.from;
        if (from === this.owner) {
            if (!fee || fee === "") {
                throw new Error("Missing fee.");
            }
            this.registrationFee = new BigNumber(fee);
            return true;
        } else {
            throw new Error("Access denied.");
        }
    },
    withdraw: function() {
        var from = Blockchain.transaction.from;
        if (from === this.owner) {
			var result = Blockchain.transfer(this.owner, this.balance);
			if (!result) {
				throw new Error("Withdrawal failed.");
			}
			this.balance = new BigNumber(0);
            return true;
        } else {
            throw new Error("Access denied.");
        }
    },
    getSettings: function() {
        var from = Blockchain.transaction.from;
        if (from === this.owner) {
            var obj = new Object();
            obj.registrationFee = this.registrationFee;
            return JSON.stringify(obj);
        } else {
            throw new Error("Access denied.");
        }
    }
};

module.exports = NebulasDappsContract;
