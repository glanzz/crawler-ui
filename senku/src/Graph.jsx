import { useEffect, useState, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { fetchGraphData, fetchNewNodes } from './api';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';

Cytoscape.use(COSEBilkent);


const GraphDashboard = () => {
  const cyRef = useRef(null);
  const [elements, setElements] = useState([]);
  const displayedNodes = useRef(new Set());
  const displayedEdges = useRef(new Set());
  // const lastUpdatedTime = useRef(Date.now());


  
  
  useEffect(() => {
    if (cyRef.current) {
        cyRef.current.layout({
          name: 'cose',
          nodeRepulsion: 100000000, // Increase repulsion for spacing
          idealEdgeLength: 200, // Adjust edge length
          nodeSpacing: 100, // Space between nodes
        }).run();
        // cyRef.current.layout({ name: 'random' }).run();
        cyRef.current.edges().style({
          'curve-style': 'bezier',
          'control-point-distance': 50,
        });
        cyRef.current.nodes().grabify();

    }
}, [elements]);
  useEffect(() => {
    
    const loadGraph = async () => {
      const graphData = await fetchGraphData(displayedNodes, displayedEdges);
      console.log(graphData);
      setElements([...graphData.nodes, ...graphData.edges]);
    };

    loadGraph();
    const interval = setInterval(async() => {
      // await fetchNewNodes(setElements, lastUpdatedTime, displayedNodes, displayedEdges)
      loadGraph();
      console.log("Fetched new nodes")
    }, 10000);

  return () => clearInterval(interval);
  }, []);


  return (
    <>
    <div>
      <img width="80px" style={{position: "fixed", "top": 0, right:0}}src="/live.gif" />
    </div>
    <CytoscapeComponent
      elements={elements}
      style={{ width: '100vw', height: '90vh' }}
      layout = {{
        name: 'cose', // Layout algorithm
        nodeRepulsion: 10000, // Increase repulsion for more spacing
        idealEdgeLength: 100, // Ideal distance between nodes connected by an edge
        edgeElasticity: 0.5, // Make edges more elastic for better separation
        nestingFactor: 0.1, // Increase nesting to reduce overlap
        nodeSpacing: 50, // Minimum spacing between nodes
      }}
      cy={cy => (cyRef.current = cy)} 
      // pan={ { x: 500, y: 200 } }
      zoom={0.1}

      stylesheet={[
        {
          selector: 'node',
          style: {
            'font-size': "12px",
            'background-color': '#D3D0CB',
            label: 'data(label)',
            'color': '#787887',
          },
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#9FB1BC',
            'target-arrow-color': '#6E8898',
            'target-arrow-shape': 'triangle',
            label: 'data(label)',
          },
        },
      ]}
    />
    </>
  );
};

export default GraphDashboard;
