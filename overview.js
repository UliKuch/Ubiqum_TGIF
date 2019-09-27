// create variables for use in global namespace
let tableMembers = {};
if (document.getElementById("senate-data")) {
  tableMembers = document.getElementById("senate-data");
} else if (document.getElementById("house-data")) {
  tableMembers = document.getElementById("house-data");
};

// default value of state filter variable is value on page load, i.e. "all"
let selectedStateFilter = document.querySelector(".drop-filter-state:checked").value;

let data = {};
let memberList = [];

let checkedCheckboxesList = [];
let filtersArr = [];


// fetch data from server, store it in variables and initialize table
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
    data = jsonResponse;
    memberList = data.results[0].members;

    // execute filter function to add content to checkedCheckboxesList
    filterByParty();

    // make filter checkboxes listen for change and update checkedCheckboxesList on change
    for (node of document.querySelectorAll(".check-filter-party")) {
      node.addEventListener("change", () => {
        filterByParty();
      });
    };

    createDropdownFilter();

    // add event listener to select element
    document.getElementById("states-dropdown").addEventListener("change", () => {
     filterByState();
    });

    // disable loaders
    for (node of document.querySelectorAll(".loader-table")) {
      node.remove();
    };

    createMemberTable(filtersArr, selectedStateFilter);
  })

};



// function to create table of all members
function createMemberTable(partyFilters, stateFilter) {

  // clear table before filling it with content
  while (tableMembers.hasChildNodes()) {
    tableMembers.removeChild(tableMembers.firstChild);
  }

  // if no partyFilters applied, behave like all partyFilters are active
  if (partyFilters.length === 0) {
    partyFilters = ["D", "R", "I"]
  };

  // create table head and captions
  let tableHeadNode = document.createElement("thead");
  let tableHeadRowNode = document.createElement("tr");
  const tableHeadCaptions = ["Name", "Party", "State", "Years in Office", "Votes with Party"];

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
  tableMembers.appendChild(tableHeadNode);

  // create table body
  let tableBodyNode = document.createElement("tbody");

  // add data to table body
  for (let i = 0; i < memberList.length; i++) {
    let member = memberList[i];

    // state filter
    if (stateFilter != "all" && member.state != stateFilter) {
      continue;
    };

    // do not add member to table if party is not in party filter
    if (!partyFilters.includes(member.party)) {
      continue;
    };

    let tableRow = document.createElement("tr");

    let middleName = "";
    if (member.middle_name != null) {
      middleName = `${member.middle_name} `;
    };

    let memberName = `${member.first_name} ${middleName}${member.last_name}`;
    let memberAttributes = [memberName, member.party, member.state, member.seniority, `${member.votes_with_party_pct} %`];

    for (let j = 0; j < memberAttributes.length; j++) {
      let tableRowData = document.createElement("td");

      // add link to name
      if (memberAttributes[j] === memberName) {
        let linkMemberPage = document.createElement("a");
        linkMemberPage.setAttribute("href", member.url);
        let linkText = document.createTextNode(memberName);
        linkMemberPage.appendChild(linkText);
        tableRowData.appendChild(linkMemberPage);
      } else {
        let tableRowText = document.createTextNode(memberAttributes[j]);
        tableRowData.appendChild(tableRowText);
      };
      tableRow.appendChild(tableRowData);
    };
    tableBodyNode.appendChild(tableRow);
  };
  tableMembers.appendChild(tableBodyNode);
};



// ***** filter by party *****
// updates checkedCheckboxesList so it includes all checked Checkboxes and filters by party
function filterByParty() {
  checkedCheckboxesList = document.querySelectorAll(".check-filter-party:checked");

  filtersArr = [];
  // filter elements if any checkboxes are checked
  if (checkedCheckboxesList.length > 0) {
    for (node of checkedCheckboxesList) {
      filtersArr.push(node.value);
    };

  };

  createMemberTable(filtersArr, selectedStateFilter);
}



// ***** filter by state *****
// add state filter values to page
function createDropdownFilter() {
  let statesDropdown = document.getElementById("states-dropdown");

  // create list of all states
  let statesList = [];
  for (member of memberList) {
    if (!statesList.includes(member.state)) {
      statesList.push(member.state);
    };
  };
  statesList = statesList.sort();

  // create options from state list
  for (state of statesList) {
    let optionNode = document.createElement("option");
    optionNode.setAttribute("value", state);
    optionNode.setAttribute("class", "drop-filter-state");
    optionNode.setAttribute("ID", `option-${state}`);
    let optionTextNode = document.createTextNode(state);
    optionNode.appendChild(optionTextNode);
    statesDropdown.appendChild(optionNode);
  };
};


// filter by state function
// this solution only works because only one filter at a time can be selected.
// for more at once filters, implement a solution similar to filterByParty()
function filterByState() {
  console.log("filterByState(): I am called!");
  // variable declared on top of file
  selectedStateFilter = document.querySelector(".drop-filter-state:checked").value;

  createMemberTable(filtersArr, selectedStateFilter);
};
