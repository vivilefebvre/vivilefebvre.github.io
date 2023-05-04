'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  // Event handlers for filter and parameter change
  let unregisterHandlerFunctions = [];

  // Use the jQuery document ready signal to know when everything has been initialized
  $(document).ready(function () {

    tableau.extensions.initializeAsync().then(function () {
      const dashboard = tableau.extensions.dashboardContent.dashboard;
      const container = document.getElementById('my-extension');

      const url = 'index.html';

      // Load the extension HTML content into the container using innerHTML
      fetch(url)
        .then(response => response.text())
        .then(html => {
          container.innerHTML = html;
        })
        .catch(error => console.error(error));

      // Get data from worksheet
      const worksheet = dashboard.worksheets[0];
      worksheet.getSummaryDataAsync().then((sumdata) => {
        const items = convertDataToItems(sumdata);

        // Render all items initially
        renderItems(items);

        // Listen for filter change
        unregisterHandlerFunctions.push(worksheet.addEventListener(tableau.TableauEventType.FilterChanged, function (filterEvent) {
          // Get filtered data
          worksheet.getSummaryDataAsync().then((sumdata) => {
            const items = convertDataToItems(sumdata);

            // Render filtered items
            renderItems(items);
          });
        }));
        tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        const pageNumberParameter = parameters.find(p => p.name === 'Page Number');
        if (pageNumberParameter) {
        // Listen for changes to the Page Number parameter
        pageNumberParameter.addEventListener(tableau.TableauEventType.ParameterChanged, function () {
          const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets[0];
          worksheet.getSummaryDataAsync().then((sumdata) => {
            const items = convertDataToItems(sumdata);

            // Render filtered items
            renderItems(items);
              });
            });
          }
        });
      });
    });
  });

  /**
   * Converts summary data to items array.
   * @param {Tableau summary data} sumdata - The summary data to convert.
   * @returns {Array} The items array.
   */
  function convertDataToItems(sumdata) {
    const { columns, data } = sumdata;
    const items = data.map((row) => {
      const item = {};
      for (let i = 0; i < columns.length; i++) {
        const field = columns[i].fieldName;
        item[field] = row[i].formattedValue;
      }
      console.log(item);
      return item;
    });
    return items;
  }


  /**
   * Renders the items to the my-extension.html template.
   * @param {Array} items - The items to render.
   */
function renderItems(items) {
  const container = document.createElement('div');
container.className = 'container';

items.forEach(item => {
  const itemContainer = document.createElement('div');
  let itemClass = '';
  let itemContent = '';

  console.log("C'EST MON ITEM : ", item);
  if (item.model === 'Modèle AUC'){
    itemClass = 'auchan';
    itemContent = `
      <div class="left">
        <p>${item.ref}</p>
        <p>${item.designation}</p>
        <p>Code ${item.tiers}: ${item.tiers_ref}</p>
        <p>${item.pieces} pieces</p>
      </div>
      <div class="right">
        <img class="barcode" src="https://barcode.tec-it.com/barcode.ashx?data=${item.EAN13}&code=Code128&translate-esc=on" alt="Barcode">
      </div>
    `;
  } else if (item.model === 'Modèle AUB') {
    itemClass = 'aubert';
    itemContent = `
      <div class="right">
        <img class="barcode" src="https://barcode.tec-it.com/barcode.ashx?data=${item.ref}&code=Code39&translate-esc=on" alt="Barcode">
      </div>
    `;
  } else if (item.model === 'Modèle ORC') {

    item.pcb = Number.parseInt(item.pcb);
    let number = Number.parseFloat(item.designation.replace(",", ".")).toFixed(4);
    item.weight = number < 1 ? number.substring(1) : number;

    itemClass = 'orchestra';
    itemContent = `
        <div id="firstcont">

            <p style=" margin-top: 12.5mm;"><span
                    style=" font-size: 9pt; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 6mm; margin-top: 12.5mm;">réf
                    client: </span> <span
                    style="font-size: 16px; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 8.8mm; margin-top: 11mm;">${item.tiers_ref}</span>
            </p>
            <p style=" margin-top: 12.5mm;"><span
                    style="font-size: 9pt; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 2.7mm; margin-top: 16mm;">Réf
                    fournisseur:</span> <span
                    style="font-size: 16px; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 2.5mm; margin-top: 29.6mm;">${item.ref}</span></p>
            <div style=" margin-top: 12.5mm;"><div
                    style="font-size: 9pt; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 4mm;">Désign</div>
                    <div id="designation">
                    <div
                    style="font-size: ${(item.designation.length >= 16 ? "16pt" : "12pt")}; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 4.2mm;">${item.designation}</div>
                    </div>
            </div>
            <p style=" margin-top: 12.5mm;"><span
                    style="font-size: 9pt; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 6mm; margin-top: 74.7mm;">PCB</span>
                <span
                    style="font-size: 16px; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 5mm; margin-top: 74.1mm;">${item.pcb}</span><span
                    style="font-size: 14px; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 14.5mm; margin-top: 76.4mm;">
                    pièces
                </span></p>

        </div>

        <div id="secondcont">


            <p
                style="font-size: 11pt; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 1mm; margin-top: 14.5mm;">
                N° du bon de commande <span style="margin-left: 2mm;">${item.pi_no_tiers}</span></p>
            <p
                style="font-size: 12pt; font-family: Arial, sans-serif;  font-weight:bold ; margin-left: 1mm; margin-top: 14.5mm;">
                ORIGINE : <span
                    style="margin-top: 14.5mm;margin-left: 2.8mm;font-size: 16px; font-family: Arial, sans-serif;  font-weight: normal;">${item.origin_country}</span>
            </p>
            <p
                style="font-size: 11pt; font-family: Arial, sans-serif;  font-weight: normal; margin-left: 1mm; margin-top: 11.5mm; font-stretch: 119.5%;">
                poids du colis<span
                    style="margin-top: 11.5mm;margin-left: 3mm;font-size: 16px; font-family: Arial, sans-serif;  font-weight: normal;"> ${item.weight} </span><span
                    style="margin-top: 11.5mm;margin-left: 6.9mm;font-size: 16px; font-family: Arial, sans-serif;  font-weight: normal;">kg</span>
            </p>

            <div id="barcode-orchestra">
                <img style="width: 44.7mm; height: 34.7mm; margin-left: 8.4mm;" src="https://barcode.tec-it.com/barcode.ashx?data=${item.barcode1}&code=${item.barcode1_type}&multiplebarcodes=true&translate-esc=true&unit=Px&imagetype=Jpg&modulewidth=1"
                    alt="Code-barres">
            </div>

        </div>`
  }

  itemContainer.className = `${itemClass} item`;
  itemContainer.innerHTML = itemContent;
  container.appendChild(itemContainer);
});

  document.body.innerHTML = '';
  document.body.appendChild(container);

  // Add the print button
  const printButton = document.createElement('button');
  printButton.id = 'print-button';
  printButton.textContent = 'Imprimer';
  document.body.appendChild(printButton);
    printButton.addEventListener('click', function() {
      // Print the extension
      window.print();
  });
}


})();
