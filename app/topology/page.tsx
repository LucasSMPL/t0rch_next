"use client";
import React, { useEffect, useState } from "react";
import { HomeIcon } from "lucide-react";
import axios from "axios";

type Pod = {
  id: string;
  label: string;
  left: string;
  top: string;
  ip1: string;
  ip2: string;
  status1?: boolean;
  status2?: boolean;
};

export default function SitePage() {
  const svgUrl = '/SMPL.svg';
  const backgroundUrl = '/site1.png';

  const initialPods: Pod[] = [
    { id: 'oso', label: 'OSO', left: '86%', top: '6%', ip1: '10.0.0.1', ip2: '10.0.0.2' },
    { id: 'pod1', label: 'POD 1', left: '73.5%', top: '85%', ip1: '10.0.0.3', ip2: '10.0.0.4' },
    { id: 'pod2', label: 'POD 2', left: '73.5%', top: '78%', ip1: '10.0.0.5', ip2: '10.0.0.6' },
    { id: 'pod3', label: 'POD 3', left: '73.5%', top: '71%', ip1: '10.0.0.7', ip2: '10.0.0.8' },
    { id: 'pod4', label: 'POD 4', left: '73.5%', top: '64%', ip1: '10.0.0.9', ip2: '10.0.0.10' },
    { id: 'pod5', label: 'POD 5', left: '73.5%', top: '57%', ip1: '10.0.0.11', ip2: '10.0.0.12' },
    { id: 'pod9', label: 'POD 9', left: '73.5%', top: '50%', ip1: '10.0.0.13', ip2: '10.0.0.14' },
    { id: 'pod10', label: 'POD 10', left: '73.5%', top: '43%', ip1: '10.0.0.15', ip2: '10.0.0.16' },
    { id: 'pod11', label: 'POD 11', left: '73.5%', top: '36%', ip1: '10.0.0.17', ip2: '10.0.0.18' },
    { id: 'pod12', label: 'POD 12', left: '73.5%', top: '29%', ip1: '10.0.0.19', ip2: '10.0.0.20' },
    { id: 'pod13', label: 'POD 13', left: '73.5%', top: '22%', ip1: '10.0.0.21', ip2: '10.0.0.22' },
    { id: 'pod14', label: 'POD 14', left: '73.5%', top: '15%', ip1: '10.0.0.23', ip2: '10.0.0.24' },
    { id: 'pod15', label: 'POD 15', left: '73.5%', top: '8%', ip1: '10.0.0.25', ip2: '10.0.0.26' },
    // Left SMPL Section
    { id: 'pod6', label: 'POD 6', left: '22%', top: '85%', ip1: '10.0.0.27', ip2: '10.0.0.28' },
    { id: 'pod7', label: 'POD 7', left: '22%', top: '70%', ip1: '10.0.0.29', ip2: '10.0.0.30' },
    { id: 'pod8', label: 'POD 8', left: '22%', top: '62%', ip1: '10.0.0.31', ip2: '10.0.0.32' },
    // West Pods (6,7,8)
    { id: 'pod16', label: 'POD 16', left: '79%', top: '85%', ip1: '10.0.0.33', ip2: '10.0.0.34' },
    { id: 'pod17', label: 'POD 17', left: '79%', top: '78%', ip1: '10.0.0.35', ip2: '10.0.0.36' },
    { id: 'pod18', label: 'POD 18', left: '79%', top: '71%', ip1: '10.0.0.37', ip2: '10.0.0.38' },
    { id: 'pod19', label: 'POD 19', left: '79%', top: '64%', ip1: '10.0.0.39', ip2: '10.0.0.40' },
    { id: 'pod20', label: 'POD 20', left: '79%', top: '57%', ip1: '10.0.0.41', ip2: '10.0.0.42' },
    { id: 'pod21', label: 'POD 21', left: '79%', top: '50%', ip1: '10.0.0.43', ip2: '10.0.0.44' },
    { id: 'pod22', label: 'POD 22', left: '79%', top: '43%', ip1: '10.0.0.45', ip2: '10.0.0.46' },
    { id: 'pod23', label: 'POD 23', left: '79%', top: '36%', ip1: '10.0.0.47', ip2: '10.0.0.48' },
    { id: 'pod26', label: 'POD 26', left: '79%', top: '29%', ip1: '10.0.0.49', ip2: '10.0.0.50' },
    { id: 'pod27', label: 'POD 27', left: '79%', top: '22%', ip1: '10.0.0.51', ip2: '10.0.0.52' },
    { id: 'pod28', label: 'POD 28', left: '79%', top: '15%', ip1: '10.0.0.53', ip2: '10.0.0.54' },
    { id: 'pod29', label: 'POD 29', left: '79%', top: '8%', ip1: '10.0.0.55', ip2: '10.0.0.56' },
    // Right SMPL Section
    { id: 'pod30', label: 'POD 30', left: '33%', top: '5%', ip1: '10.0.0.57', ip2: '10.0.0.58' },
    { id: 'pod31', label: 'POD 31', left: '33%', top: '12%', ip1: '10.0.0.59', ip2: '10.0.0.60' },
    { id: 'pod32', label: 'POD 32', left: '33%', top: '19%', ip1: '10.0.0.61', ip2: '10.0.0.62' },
    { id: 'pod33', label: 'POD 33', left: '33%', top: '26%', ip1: '10.0.0.63', ip2: '10.0.0.64' },
    { id: 'pod34', label: 'POD 34', left: '33%', top: '33%', ip1: '10.0.0.65', ip2: '10.0.0.66' },
    { id: 'pod35', label: 'POD 35', left: '33%', top: '40%', ip1: '10.0.0.67', ip2: '10.0.0.68' },
    // North 30 Section
  ];

  const rectangles = [
    { id: 'giga1', label: 'GIGA 1', left: '45%', top: '78%', width: '75px', height: '150px' },
    { id: 'giga2', label: 'GIGA 2', left: '45%', top: '60%', width: '75px', height: '150px' },
    { id: 'giga3', label: 'GIGA 3', left: '45%', top: '42%', width: '75px', height: '150px' },
    { id: 'giga4', label: 'GIGA 4', left: '45%', top: '24%', width: '75px', height: '150px' },
  ];

  const [pods, setPods] = useState<Pod[]>(initialPods);

  useEffect(() => {
    async function fetchPingStatus() {
      const updatedPods = await Promise.all(pods.map(async (pod) => {
        try {
          const response = await axios.get(`/api/ping?ip1=${pod.ip1}&ip2=${pod.ip2}`);
          const { ip1, ip2 } = response.data;
          return { ...pod, status1: ip1.alive, status2: ip2.alive };
        } catch (error) {
          console.error('Error fetching ping status:', error);
          return { ...pod, status1: false, status2: false };
        }
      }));

      setPods(updatedPods);
    }

    fetchPingStatus();
  }, []);

  return (
    <>
      {/* <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img src={svgUrl} alt="t0 wordmark" style={{ width: '550px', height: '300px' }} />
      </div> */}

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '110vh',
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {pods.map((pod) => (
          <div
            key={pod.id}
            style={{
              position: 'absolute',
              left: pod.left,
              top: pod.top,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'black', // Ensure text is visible
              textAlign: 'center',
              fontSize: '12px', // Make the text smaller
            }}
          >
            <HomeIcon size={25} />
            <div>{pod.label}</div>
            <div>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                backgroundColor: pod.status1 ? 'green' : 'red',
                borderRadius: '50%',
                marginRight: '4px',
              }}></span>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                backgroundColor: pod.status2 ? 'green' : 'red',
                borderRadius: '50%',
              }}></span>
            </div>
          </div>
        ))}
        {rectangles.map((rect) => (
          <div
            key={rect.id}
            style={{
              position: 'absolute',
              borderRadius: '10px',
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              backgroundColor: 'black',
              border: '2px solid white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              textAlign: 'center',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {rect.label}
          </div>
        ))}
      </div>
    </>
  );
}