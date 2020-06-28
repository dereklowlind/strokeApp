import React from 'react';
import {Table, TableBody, TableCell,TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import FileDownloaderJson from './FileDownloaderJson';
import FileDownloaderCsv from './FileDownloaderCsv'

function DataEntriesTable(props) {
  if(props.dataEntries == ""){
    return <div></div>
  }
  let rows = []
  props.dataEntries.forEach(doc => {
    // console.log(doc.data().datetime)
    const timeStamp = doc.data().datetime.toDate().toString()
    rows.push({
      docId: doc.id,
      timeStamp: timeStamp,
      desc: doc.data().description,
      rawData: doc,
    })
  })
    
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>DocId</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">TimeStamp</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.docId}>
              <TableCell component="th" scope="row">
                {row.docId}
              </TableCell>
              <TableCell align="right">{row.desc}</TableCell>
              <TableCell align="right">{row.timeStamp}</TableCell>
              <TableCell>
                <FileDownloaderJson rawData={row.rawData}/>
              </TableCell>
              <TableCell>
                <FileDownloaderCsv rawData={row.rawData}/>
              </TableCell>
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

}
export default DataEntriesTable;
  