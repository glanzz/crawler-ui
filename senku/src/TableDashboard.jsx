import { useState, useEffect } from 'react';
import { Pagination, TableCell, TableContainer, TableHead, TableRow,TableBody, Table, Paper,  CircularProgress } from '@mui/material';
import { searchPages } from './api';

const TableDashboard = () => {
  const [page, setPage] = useState(1);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUrls = async (pageNumber) => {
    setLoading(true);
    try {
      const data = await searchPages(pageNumber, 100);
      setNodes(data.nodes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls(page);
  }, [page]);


  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      {loading ? (
        <div style={{width: "100%", height: "85vh"}}>
        <CircularProgress />
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: "100vw",
        }}>
          <TableContainer style={{marginLeft: "auto", textAlign: "center"}} component={Paper}>
          <Table sx={{ margin: "auto", width: 650 }} size="small" aria-label="a dense table">
            <TableHead>
                  <TableRow>
                    <TableCell sx={{width: "150px"}}>URL</TableCell>
                    <TableCell align="right">Host</TableCell>
                    <TableCell align="right">Indegree</TableCell>
                    <TableCell align="right">Outdegree</TableCell>
                  </TableRow>
                </TableHead>
            
              
              
                
                <TableBody>
                {nodes.map((node, index) => (
                    <TableRow
                      key={node.url}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell sx={{lineBreak: "anywhere"}} component="th" scope="row">
                        {node.url}
                      </TableCell>
                      <TableCell align="right">{node.host}</TableCell>
                      <TableCell align="right">{node.incomingEdges.low}</TableCell>
                      <TableCell align="right">{node.outgoingEdges.low}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </TableContainer>
          <Pagination
          style={{position: 'fixed', bottom: "10px", right: "25px", backgroundColor: "white", padding: "10px", borderRadius: "12px"}}
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="large"
          />
        </div>
      )}
    </>
  );
};

export default TableDashboard;
