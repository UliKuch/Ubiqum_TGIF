var app = new Vue({
  el: "#app",
  data: {
    members: [],
    captions: [],
    stateList: [],
    stateListUniq: [],
    parties: [],
    activeParties: [],
    filteredParties: [],
    filteredState: [],
  },
  computed: {
  },
  methods: {
    filterMembers: function (mem) {
      return mem.filter(member => {
        if (member.state === this.filteredState || this.filteredState.length === 0) {
          if (this.filteredParties.includes(member.party) || this.filteredParties.length === 0) {
            return member;
          }
        }
      })
    },
    partyNames: function (party) {
      switch(party) {
        case "D":
          return "Democrat";
        case "R":
          return "Republican";
        case "I":
          return "Independent";
      }
    },
  },
});



app.members = data.results[0].members;
app.captions = ["Name", "Party", "State", "Years in Office", "Votes with Party"];
app.stateList = app.members.map(function (member) {
  return member.state
});
app.stateListUniq = app.stateList.filter(function (item, index) {
  return app.stateList.indexOf(item) === index
}).sort();
app.parties = ["D", "R", "I"];
