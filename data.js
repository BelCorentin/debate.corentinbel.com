/* assembles topics; each topic lives in data_<topic>.js (missing files are skipped) */
window.DATA = {
  updated: "23 novembre 2026",
  topics: ["femmes", "immigration", "retraites", "dette", "impots", "securite", "assistanat", "ecole", "laicite", "climat", "europe", "sante", "democratie"].map(k => window["TOPIC_" + k.toUpperCase()]).filter(Boolean),
};
