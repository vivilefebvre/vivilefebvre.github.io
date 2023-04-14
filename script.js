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
    itemContainer.className = 'item';

    const leftContainer = document.createElement('div');
    leftContainer.className = 'left';

    const referenceNumber = document.createElement('p');
    referenceNumber.textContent = `${item.ref}`;
    leftContainer.appendChild(referenceNumber);

    const name = document.createElement('p');
    name.textContent = `${item.designation}`;
    leftContainer.appendChild(name);

    const tiersName = document.createElement('p');
    tiersName.textContent = `Code ${item.tiers}:      ${item.tiers_ref}`;
    leftContainer.appendChild(tiersName);

    const pieces = document.createElement('p');
    pieces.textContent = `${item.pieces}      pieces`;
    leftContainer.appendChild(pieces);

    itemContainer.appendChild(leftContainer);

    const rightContainer = document.createElement('div');
    rightContainer.className = 'right';

    const barcode = document.createElement('img');
    barcode.className = 'barcode';
    barcode.src = `https://barcode.tec-it.com/barcode.ashx?data=${item.ref}&code=Code128&translate-esc=on`;
    barcode.alt = 'Barcode';

    rightContainer.appendChild(barcode);

    itemContainer.appendChild(rightContainer);

    container.appendChild(itemContainer);
  });

  // Clear existing items
  document.body.innerHTML = '';

  // Add the container to the body
  document.body.appendChild(container);

  // Add the print button
  const printButton = document.createElement('button');
  printButton.id = 'print-button';
  printButton.textContent = 'Print';
  document.body.appendChild(printButton);
    printButton.addEventListener('click', function() {
      console.log('my print button')
      // Hide the print button
      printButton.style.display = 'none';
      // Print the extension
      window.print();
      // Show the print button again
      printButton.style.display = 'block';
  });
}



})();
