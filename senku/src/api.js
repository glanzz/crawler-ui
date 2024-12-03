import neo4j from 'neo4j-driver';
import moment from "moment";

const driver = neo4j.driver(
  import.meta.env.VITE_NEO4J_URI,
  neo4j.auth.basic(import.meta.env.VITE_NEO4J_USERNAME, import.meta.env.VITE_NEO4J_PASSWORD)
);


const getNodeLabel = (source) => `${source.properties.url}(${source.properties.visited_at})`;
const getEdgeLabel = (relationship) => `${relationship.type}(${relationship.properties.times})`;

const getEdgeId= (source, rel, target) => `${source.identity.toString()}-${rel.type}-${target.identity.toString()}`;


export const fetchGraphData = async (displayedNodes, displayedEdges) => {

  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (p:Page)-[r:REFERS]->(c:Page) RETURN c,p,r LIMIT 200;
    `);

    const nodes = [];
    const edges = [];

    result.records.forEach(record => {
      
      const source = record.get('p');
      const target = record.get('c');
      const relationship = record.get('r');

      nodes.push({
        data: { id: source.identity.toString(), label: getNodeLabel(source)}
      });
      nodes.push({
        data: { id: target.identity.toString(), label: getNodeLabel(target)}
      });
      edges.push({
        data: {
          source: source.identity.toString(),
          target: target.identity.toString(),
          label: getEdgeLabel(relationship)
        }
      });

      if (!displayedNodes.current.has(source.identity.toString())) {
        displayedNodes.current.add(source.identity.toString());
      }
      if (!displayedNodes.current.has(target.identity.toString())) {
        displayedNodes.current.add(target.identity.toString());
      }
      const edgeId = getEdgeId(source, relationship, target);
      if (!displayedEdges.current.has(edgeId)) {
        displayedEdges.current.add(edgeId);
      }
    });

    return { nodes, edges };
  } finally {
    await session.close();
  }
};



export const searchPages = async (pageNumber, limit=100, name="") => {
  console.log(name);

  const skip = (pageNumber - 1) * limit;

  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (p:Page)
      OPTIONAL MATCH (incoming:Page)-[r:REFERS]->(p)
      WITH p, SUM(r.times) AS incomingEdges
      OPTIONAL MATCH (p)-[r:REFERS]->(outgoing:Page)
      WITH p, incomingEdges, COUNT(r) AS outdegree
      SKIP ${skip} LIMIT ${limit}
      ORDER BY incomingEdges * outdegree
      RETURN p AS node, 
            incomingEdges, 
            outdegree`,
      // { skip: parseInt(skip), limit: parseInt(limit) }
    );

    const nodes = [];

    result.records.forEach(record => {
      const source = record.get('node');
      const incomingEdges = record.get('incomingEdges');
      const outgoingEdges = record.get('outdegree');
      nodes.push({
        ...source.properties,
        incomingEdges,
        outgoingEdges,
      })
      
    });
    const totalCountResult = await session.run(
      `MATCH (p:Page)
       RETURN COUNT(p) AS totalCount`
    );

    const totalCount = totalCountResult.records[0].get('totalCount');
    const totalPages = Math.ceil(Number(totalCount) / limit);
    console.log(nodes);
    console.log(totalPages);
    return {nodes, totalPages};
  } finally {
    await session.close();
  }
};



export const fetchNewNodes = async (setElements, lastUpdatedTime, displayedNodes, displayedEdges) => {
const session = driver.session();

    try {
      const a = moment(lastUpdatedTime.current).format("ddd MMM DD HH:mm:ss YYYY");
      const result = await session.run(`MATCH (n:Page)-[r:REFERS]->(m:Page) WHERE n.visited_at > '${a}' RETURN n, r, m`,
      );
      console.log("Latest results:", result);

      const newElements = [];
      result.records.forEach(record => {
        const source = record.get('n');
        const target = record.get('m');
        const relationship = record.get('r');

        // Add new nodes if not already displayed
        if (!displayedNodes.current.has(source.identity.toString())) {
          newElements.push({
            data: { id: source.identity.toString(), label: getNodeLabel(source) },
          });
          displayedNodes.current.add(source.identity.toString());
        }

        if (!displayedNodes.current.has(target.identity.toString())) {
          newElements.push({
            data: { id: target.identity.toString(), label: getNodeLabel(target) },
          });
          displayedNodes.current.add(target.identity.toString());
        }


        const edgeId = getEdgeId(source, relationship, target);
        // `${source.identity.toString()}-${relationship.type}-${target.identity.toString()}`;
        if (!displayedEdges.current.has(edgeId)) {
          newElements.push({
            data: {
              id: edgeId,
              source: source.identity.toString(),
              target: target.identity.toString(),
              label: getEdgeLabel(relationship),
            },
          });
          displayedEdges.current.add(edgeId);
        }
      });

      if (newElements.length > 0) {
        setElements(prevElements => [...prevElements, ...newElements]);
      }
      lastUpdatedTime.current = Date.now();
    } catch (error) {
      console.log(error);
      console.error('Error fetching new data:', error);
    } finally {
      session.close();
    }
};
