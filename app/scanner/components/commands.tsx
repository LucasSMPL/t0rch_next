import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Commands = () => {
  return (
    <Table>
      <TableCaption>A list of your recent commands.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Progress</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">CMD_1001</TableCell>
          <TableCell>In-Progress</TableCell>
          <TableCell>Rebooting "LSCHWAM.OG"</TableCell>
          <TableCell className="text-right">92%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">CMD_999</TableCell>
          <TableCell>Completed</TableCell>
          <TableCell>Upgraded Firmware on "adamhaynes.1"</TableCell>
          <TableCell className="text-right">100%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default Commands;
