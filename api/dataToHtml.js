function dataToTable(header, data) {
  const headerArr = Object.keys(header).map((k) => `<th>${header[k]}</th>`);
  const t_header = `<thead><tr>${headerArr.join("")}</tr></thead>`;
  let rows = "";
  data.forEach((element) => {
    rows += "<tr>";
    Object.keys(header).forEach((k) => (rows += `<td>${element[k]}</td>`));
    rows += "</tr>";
  });
  const t_body = `<tbody>${rows}</tbody>`;
  const table = `<table>${t_header}${t_body}</table>`;

  return table;
}

module.exports = {
  dataToTable,
};
