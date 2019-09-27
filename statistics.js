// initialize variables, fill them with content in async function
let data = {};
let memberlist = [];

let demList = [];
let repList = [];
let indList = [];

let demAvWithPartyValue = 0;
let repAvWithPartyValue = 0;

let demAvMissedVotesValue = 0;
let repAvMissedVotesValue = 0;
let indAvMissedVotesValue = 0;

let missedMostList = [];
let missedLeastList = [];
let withPartyMostList = [];
let withPartyLeastList = [];

let statistics = {
  demNum: 0,
  repNum: 0,
  indNum: 0,
  demAvWithParty: 0,
  repAvWithParty: 0,
  withPartyMost: 0,
  withPartyLeast: 0,
  demAvMissedVotes: 0,
  repAvMissedVotes: 0,
  indAvMissedVotes: 0,
  missedMost: 0,
  missedLeast: 0,
}

// av. voted with party
let totalAvWithParty = 0;
let matchVotedWithParty = [];
let captionVotedWithParty =  0;

// av. missed votes
let totalAvMissedVotes =  0;
let matchAvMissedVotes = [];
let captionAvMissedVotes =  0;


// fetch data from server, store it in variables and initialize some variables and the tables
async function renderTableData(dataObject) {

  let url = dataObject.url;

  fetch(url, {
    method: "GET",
    headers: {
      // for apiKey see keys.js
      "X-API-Key": apiKey,
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error("Request failed!");
  }, networkError => console.log(networkError.message)).then(jsonResponse => {

    // fill variables with content

    data = jsonResponse;
    memberList = data.results[0].members;

    // fill lists by party w/ content
    for (let i = 0; i < memberList.length; i++) {
      let member = memberList[i];
      if (member.party === "D") {
        demList.push(member);
      } else if (member.party === "R") {
        repList.push(member);
      } else {
        indList.push(member);
      };
    };

    // calculate average votes with party

    // handle missing values in data object
    let missingValues = 0;

    demAvWithPartyValue = demList.reduce((a, c) => {
      if (c.votes_with_party_pct != undefined && c.votes_with_party_pct != null) {
        return a + c.votes_with_party_pct;
      } else {
        missingValues++;
        return 0;
      }
    }, 0) / (demList.length - missingValues);
    missingValues = 0;
    repAvWithPartyValue = repList.reduce((a, c) => {
      if (c.votes_with_party_pct != undefined && c.votes_with_party_pct != null) {
        return a + c.votes_with_party_pct;
      } else {
        missingValues++;
        return 0;
      }
    }, 0) / (repList.length - missingValues);


    // calculate average missed votes

    missingValues = 0;
    demAvMissedVotesValue = demList.reduce((a, c) => {
      if (c.missed_votes_pct != undefined && c.missed_votes_pct != null) {
        return a + c.missed_votes_pct;
      } else {
        missingValues++;
        return 0;
      }
    }, 0) / (demList.length - missingValues);

    missingValues = 0;
    repAvMissedVotesValue = repList.reduce((a, c) => {
      if (c.missed_votes_pct != undefined && c.missed_votes_pct != null) {
        return a + c.missed_votes_pct;
      } else {
        missingValues++;
        return 0;
      }
    }, 0) / (repList.length - missingValues);

    missingValues = 0;
    indAvMissedVotesValue = indList.reduce((a, c) => {
      if (c.missed_votes_pct != undefined && c.missed_votes_pct != null) {
        return a + c.missed_votes_pct;
      } else {
        missingValues++;
        return 0;
      }
    }, 0) / (indList.length - missingValues);

    // get top ten percent for different parameters
    missedMostList =  getTopTenPercent("missed_votes_pct", "highest");
    missedLeastList = getTopTenPercent("missed_votes_pct", "lowest");
    withPartyMostList = getTopTenPercent("votes_with_party_pct", "highest");
    withPartyLeastList = getTopTenPercent("votes_with_party_pct", "lowest");

    // statistics object
    statistics = {
      demNum: demList.length,
      repNum: repList.length,
      indNum: indList.length,
      demAvWithParty: demAvWithPartyValue,
      repAvWithParty: repAvWithPartyValue,
      withPartyMost: withPartyMostList,
      withPartyLeast: withPartyLeastList,
      demAvMissedVotes: demAvMissedVotesValue,
      repAvMissedVotes: repAvMissedVotesValue,
      indAvMissedVotes: indAvMissedVotesValue,
      missedMost: missedMostList,
      missedLeast: missedLeastList,
    };

    // form arguments for different overview tables
    // av. voted with party
    totalAvWithParty = (statistics.demAvWithParty + statistics.repAvWithParty) / 2;
    matchVotedWithParty = [`${statistics.demAvWithParty.toFixed(2)} %`, `${statistics.repAvWithParty.toFixed(2)} %`, "-", `${totalAvWithParty.toFixed(2)} %`];
    captionVotedWithParty = "Av. Voted w/ Party";

    // av. missed votes
    totalAvMissedVotes = (statistics.demAvWithParty + statistics.repAvWithParty + statistics.indAvWithParty) / 3;
    matchAvMissedVotes = [`${statistics.demAvMissedVotes.toFixed(2)} %`, `${statistics.repAvMissedVotes.toFixed(2)} %`, `${statistics.indAvMissedVotes.toFixed(2)} %`, `${totalAvWithParty.toFixed(2)} %`];
    captionAvMissedVotes = "Av. Missed Votes";

    // disable loaders
    for (node of document.querySelectorAll(".loader-table")) {
      node.remove();
    };

    // call overview function with different args for attendance and party loyalty pages
    if (document.getElementById("main").classList.contains("attendance")) {
      createOverviewTable(matchAvMissedVotes, captionAvMissedVotes);
    } else if (document.getElementById("main").classList.contains("party-loyalty")) {
      createOverviewTable(matchVotedWithParty, captionVotedWithParty);
    };

    // call ranking table function with different args for attendance and party loyalty pages
    if (document.getElementById("main").classList.contains("attendance")) {
      createRankingTable("leastAttTable", "att", statistics.missedMost);
      createRankingTable("mostAttTable", "att", statistics.missedLeast);
    } else if (document.getElementById("main").classList.contains("party-loyalty")) {
      createRankingTable("leastLoyTable", "loy", statistics.withPartyLeast);
      createRankingTable("mostLoyTable", "loy", statistics.withPartyMost);
    };
  })

};


// function to calculate the top 10 percent with a given value
function getTopTenPercent(property, order) {

  // remove members who did not have to vote (total_votes === 0 or null)
  let memberListOnlyAttendees = [];
  for (let i = 0; i < memberList.length; i++) {
    if (memberList[i].total_votes != 0 && memberList[i].total_votes != null) {
      memberListOnlyAttendees.push(memberList[i]);
    }
  };

  // create sorted list of members w/ different sorting orders
  let sortedMemberList = [];
  if (order === "lowest") {
    sortedMemberList = memberListOnlyAttendees.sort((a, b) => (a[property] > b[property]) ? 1 : (a[property] === b[property]) ? 0 : -1 );
  } else if (order === "highest") {
    sortedMemberList = memberListOnlyAttendees.sort((b, a) => (a[property] > b[property]) ? 1 : (a[property] === b[property]) ? 0 : -1 );
  };

  let lengthTopTenPercent = Math.ceil(memberListOnlyAttendees.length / 10);

  let output = [];

  // function to check for and, if necessary, add to output members that have the same value for propert as the last of the top ten percent
  function findEquals(x) {
    if (sortedMemberList[x][property] === sortedMemberList[x + 1][property]) {
      output.push(sortedMemberList[x + 1]);
      findEquals(x + 1);
    };
  };

  // add top ten percent to output list
  for (let i = 0; i < lengthTopTenPercent; i++) {
    output.push(sortedMemberList[i]);
    if (i === lengthTopTenPercent - 1) {
      findEquals(i);
    };
  };

  // // Debugging
  // console.log(property);
  // console.log(sortedMemberList);
  // sortedProperty = [];
  // for (let i = 0; i < sortedMemberList.length; i++) {
  //   sortedProperty.push(sortedMemberList[i][property]);
  // };
  // console.log(sortedProperty);
  // console.log(output);

  return output;
};


// create overview table
function createOverviewTable(matchColumnThree, captionColumnThree) {
  let tableOverview = document.getElementById("overviewTable");

  // create table head and captions
  let tableHeadNode = document.createElement("thead");
  let tableHeadRowNode = document.createElement("tr");
  const tableHeadCaptions = ["Party", "No. of Reps", captionColumnThree];


  // add data to head row
  for (let i = 0; i < tableHeadCaptions.length; i++) {
    let tableHeadRowDataNode = document.createElement("th");
    tableHeadRowDataNode.setAttribute("scope", "col");
    let tableHeadRowDataTextNode = document.createTextNode(tableHeadCaptions[i]);
    tableHeadRowDataNode.appendChild(tableHeadRowDataTextNode);
    tableHeadRowNode.appendChild(tableHeadRowDataNode);
  };

  // add head row to head node and head node to table
  tableHeadNode.appendChild(tableHeadRowNode);
  tableOverview.appendChild(tableHeadNode);

  // create table body
  let tableBodyNode = document.createElement("tbody");
  const tableRowCaptions = ["Democrats", "Republicans", "Independents", "Total"];

  // match content to columns
  const matchNumReps = [statistics.demNum, statistics.repNum, statistics.indNum, memberList.length];

  // add data to table body
  // create rows
  for (let i = 0; i < 4; i++) {
    let tableRow = document.createElement("tr");

    // fill each cell with content
    for (let j = 0; j < 3; j++) {
      // initialize variables
      let tableRowData = "";
      let tableRowText = "";

      // add captions in first column
      if (j === 0) {
        tableRowData = document.createElement("th");
        tableRowData.setAttribute("scope", "row");
        tableRowText = document.createTextNode(tableRowCaptions[i]);

      // second column
      } else if (j === 1) {
        tableRowData = document.createElement("td");
        tableRowText = document.createTextNode(matchNumReps[i]);

      // third column
      } else {
        tableRowData = document.createElement("td");
        tableRowText = document.createTextNode(matchColumnThree[i]);
      };
      // add text to cell and cell to row
      tableRowData.appendChild(tableRowText);
      tableRow.appendChild(tableRowData);
    };
    // add row to body
    tableBodyNode.appendChild(tableRow);
  };
  // add body to table
  tableOverview.appendChild(tableBodyNode);
};


function createRankingTable(tableID, attOrLoy, topTenList) {

  // error handling
  if (!document.getElementById(tableID)) {
    console.log("Table ID not found");
    return 1;
  } else if (attOrLoy != "att" && attOrLoy != "loy") {
    console.log("Second argument of createRankingTable() has to be 'att' or 'loy'.");
    return 1;
  } else if (typeof topTenList != "object") {
    console.log("Third argument of createRankingTable() has to be a list of objects.");
    return 1;
  }

  let tableRanking = document.getElementById(tableID);

  // create table head and captions
  let tableHeadNode = document.createElement("thead");
  let tableHeadRowNode = document.createElement("tr");

  // different captions for attendance and loyalty
  let captionsHeader = [];
  (attOrLoy === "att") ? captionsHeader = ["Name", "No. Missed Votes", "% Missed"] : captionsHeader = ["Name", "No. Party Votes", "% Party Votes"];

  // add data to head row
  for (let i = 0; i < captionsHeader.length; i++) {
    let tableHeadRowDataNode = document.createElement("th");
    tableHeadRowDataNode.setAttribute("scope", "col");
    let tableHeadRowDataTextNode = document.createTextNode(captionsHeader[i]);
    tableHeadRowDataNode.appendChild(tableHeadRowDataTextNode);
    tableHeadRowNode.appendChild(tableHeadRowDataNode);
  };

  // add head row to head node and head node to table
  tableHeadNode.appendChild(tableHeadRowNode);
  tableRanking.appendChild(tableHeadNode);

  // create table body
  let tableBodyNode = document.createElement("tbody");


  // add data to table body
  // create rows
  for (let i = 0; i < topTenList.length; i++) {
    let tableRow = document.createElement("tr");
    let member = topTenList[i];

    // member name with middle name
    let middleName = "";
    if (member.middle_name != null) {
      middleName = `${member.middle_name} `;
    };
    let memberName = `${member.first_name} ${middleName}${member.last_name}`;

    // calculate absolute number of votes with party
    let numVotesWithParty = Math.round((member.total_votes - member.missed_votes) * member.votes_with_party_pct / 100)

    // different row content for attendance and loyalty
    let contentRows = [];
    (attOrLoy === "att") ? contentRows = [memberName, member.missed_votes, member.missed_votes_pct] : contentRows = [memberName, numVotesWithParty, member.votes_with_party_pct];


    // fill each cell with content
    for (let j = 0; j < 3; j++) {
      // initialize variables
      let tableRowData = "";
      let tableRowText = "";

      // add full name with link in first column
      if (j === 0) {
        tableRowData = document.createElement("th");
        tableRowData.setAttribute("scope", "row");

        let linkMemberPage = document.createElement("a");
        linkMemberPage.setAttribute("href", member.url);
        let linkText = document.createTextNode(contentRows[j]);
        linkMemberPage.appendChild(linkText);
        tableRowData.appendChild(linkMemberPage);
      // second and third column
      } else {
        tableRowData = document.createElement("td");
        tableRowText = document.createTextNode(contentRows[j]);
        tableRowData.appendChild(tableRowText);

      };
      // add text to cell and cell to row
      tableRow.appendChild(tableRowData);
    };
    // add row to body
    tableBodyNode.appendChild(tableRow);
  };
  // add body to table
  tableRanking.appendChild(tableBodyNode);
};
