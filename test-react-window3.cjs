const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { List } = require('react-window');

try {
  const element = React.createElement(List, {
    rowCount: 10,
    rowHeight: 50,
    rowComponent: ({ index, style }) => React.createElement('div', { style }, `Row ${index}`),
    rowProps: null,
    style: { height: 500, width: 500 }
  });
  console.log(ReactDOMServer.renderToString(element));
} catch (err) {
  console.error("ERROR CAUGHT:");
  console.error(err.stack);
}
