"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Bitcoin, Receipt, BarChart4 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Function to fetch LMP data
const fetchLMPData = async (datasetType: string) => {
  try {
    const response = await axios.get('https://api.misoenergy.org/MISORTWDDataBroker/DataBrokerServices.asmx?messageType=getLMPConsolidatedTable&returnType=json');
    const data = response.data;

    if (data && data.LMPData && data.LMPData[datasetType] && data.LMPData[datasetType].PricingNode) {
      const pricingNodes = data.LMPData[datasetType].PricingNode;

      // Filter for ALTW.ALTW node
      const altwData = pricingNodes.find((node: { name: string; }) => node.name === 'ALTW.ALTW');

      if (altwData) {
        return altwData.LMP;
      } else {
        console.log(`ALTW.ALTW node not found in ${datasetType}`);
        return 'ALTW.ALTW node not found';
      }
    } else {
      console.log(`No data found for ${datasetType}`);
      return 'No data found';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return 'Error fetching data';
  }
};

const LMPCard = () => {
  const [lmp, setLmp] = useState('Loading...');

  useEffect(() => {
    const getData = async () => {
      // Change the dataset type here if needed: 'FiveMinLMP', 'HourlyIntegratedLMP', 'DayAheadExAnteLMP', 'DayAheadExPostLMP'
      const data = await fetchLMPData('FiveMinLMP');
      setLmp(data);
    };

    getData();
  }, []);

  return (
    <>
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
      <img src='/SMPL.svg' alt="t0 wordmark" style={{ width: '550px', height: '300px' }} />
    </div>
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 pl-20 pr-20 pb-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">
              ALTW 5m Price
            </CardTitle>
            <Bitcoin />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#22ff00]">
              ${lmp}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">
              Current Site Status
            </CardTitle>
            <Receipt />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold text-[#22ff00] flex items-center">
            ONLINE
            <span style={{
              display: 'inline-block',
              marginLeft: '8px',
              width: '10px',
              height: '10px',
              backgroundColor: '#22ff00',
              borderRadius: '50%',
            }}></span>
          </div>
        </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">
              Curtailment Target Price
            </CardTitle>
            <BarChart4 />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#22ff00]">
              $150.00
            </div>
          </CardContent>
        </Card>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button style={{ backgroundColor: 'red', color: 'white' }}>NUKE SITE / MANUAL OVERIDE</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '25px' }}>Overview All Miners</h3>
      <Table style={{ width: 'auto', maxWidth: '90%', margin: '0 auto' }}>
        <TableHeader className="sticky top-0 bg-black z-10">
          <TableRow>
            <TableHead className="text-center w-[100px]">IP</TableHead>
            <TableHead className="text-center">Worker</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-center font-medium">10.0.0.69</TableCell>
            <TableCell className="text-center">LSCHWAM.OG</TableCell>
            <TableCell className="text-center">Normal</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-center font-medium">10.0.0.5</TableCell>
            <TableCell className="text-center">LSCHWAM.5</TableCell>
            <TableCell className="text-center">Sleeping</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-center font-medium">10.0.0.18</TableCell>
            <TableCell className="text-center">NHbHsLckQJEjtAbyDsj1ZGPus3HZe2ez32ZQ.LSCHWAM1</TableCell>
            <TableCell className="text-center">Sleeping</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    </>
  );
};

export default LMPCard;	

// Site 1 = 8180
// Site 2 = 8179
// Site 3 = 25955
// SMPL = 21556
// Inventory = 25701
// Shelby = 26627
// PrarieRose = 27213

// e94d1b
//ff7f0f