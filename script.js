const serverUrl = "https://q0fsoa7mcyft.usemoralis.com:2053/server";
      const appId = "iniyM4gknpG3Ns6bi8Pj8zAGiQD1CSyrhjzTF8dK";
      Moralis.start({ serverUrl, appId });

      // add from here down
      // LOG IN WITH METAMASK
      async function login() {
        let user = Moralis.User.current();
        if (!user) {
          user = await Moralis.authenticate();
        }
        console.log("logged in user:", user);
        getStats();
      }

      // LOG OUT
      async function logOut() {
        await Moralis.User.logOut();
        console.log("logged out");
      }

      // bind button click handlers
      document.getElementById("btn-login").onclick = login;
      document.getElementById("btn-logout").onclick = logOut;
      document.getElementById("btn-get-stats").onclick = getStats;

      // refresh stats
      function getStats() {
        const user = Moralis.User.current();
        if (user) {
          getUserTransactions(user);
        }
        getAverageGasPrices();
      }

      // HISTORICAL TRANSACTIONS
      async function getUserTransactions(user) {
        // create query
        const query = new Moralis.Query("EthTransactions");
        query.equalTo("from_address", user.get("ethAddress"));

        // subscribe to query updates
        const subscription = await query.subscribe();
        handleNewTransaction(subscription);

        // run query
        const results = await query.find();
        console.log("user transactions:", results);
      }

      // REAL-TIME TRANSACTIONS
      async function handleNewTransaction(subscription) {
        // log each new transaction
        subscription.on("create", function (data) {
          console.log("new transaction: ", data);
        });
      }

      // CLOUD FUNCTION
      async function getAverageGasPrices() {
        const results = await Moralis.Cloud.run("getAvgGas");
        console.log("average user gas prices:", results);
        renderGasStats(results);
      }

      function renderGasStats(data) {
        const container = document.getElementById("gas-stats");
        container.innerHTML = data
          .map(function (row, rank) {
            return `<li>#${rank + 1}: ${Math.round(row.avgGas)} gwei</li>`;
          })
          .join("");
      }

      //get stats on page load
      getStats();