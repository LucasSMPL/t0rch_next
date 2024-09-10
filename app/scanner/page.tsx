"use client";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useMemo, useState } from "react";
// import { useLocalStorage } from "usehooks-ts";
import { useLocalStorageValue } from "@react-hookz/web";
import ScanTable from "./components/scan-table";
import ScannerStats from "./components/scanner-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Commands from "./components/commands";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ScannerPage() {
  const { toast } = useToast();

  const [ips, setIps] = useState<ScannedIp[]>([]);
  const selectedRanges = useLocalStorageValue<IpRange[]>("selected-ranges", {
    defaultValue: [],
    initializeWithValue: false,
  });
  const [progress, setProgress] = useState<number | null>(null);
  const total = useMemo(
    () =>
      selectedRanges.value?.reduce((t, c) => t + c.end - c.start + 1, 0) ?? 0,
    [selectedRanges]
  );

  const startScan = async () => {
    if (!selectedRanges.value?.length) {
      return toast({
        title: "Please choose at least one range!",
        variant: "destructive",
      });
    }
    try {
      setProgress(0);
      setIps([]);
      const response = await fetch(`http://localhost:7070/scan`, {
        method: "POST",
        body: JSON.stringify({
          ranges: selectedRanges.value?.map((e) => ({
            start: `${e.address}.${e.start}`,
            end: `${e.address}.${e.end}`,
          })),
        }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true && reader != null) {
        const { value, done } = await reader.read();
        if (done) break;
        const d = decoder.decode(value);
        // const decoded: ScannedIp[] = JSON.parse(`[${d.replace(/}{/g, "},{")}]`);
        // setIps((prev) => [...prev, ...decoded]);
        // const decoded: { event: string; data: ScannedIp } = JSON.parse(d);
        const matches = d.match(/data:(\{.*?\})/gs);

        const extractedData: ScannedIp[] | undefined = matches?.map((match) =>
          JSON.parse(match.replace("data:", "").trim())
        );
        if (extractedData) {
          setIps((prev) => [...prev, ...extractedData]);
          setProgress((ips.length / total) * 100);
        }
      }
      reader?.cancel();
    } catch (error) {
      console.error("Error during scan:", error);
    } finally {
      setProgress(null);
    }
  };
  return (
    <Tabs defaultValue="scanner">
  <TabsList>
    <TabsTrigger value="scanner">t0rch</TabsTrigger>
    <TabsTrigger value="reporter">rep0rter</TabsTrigger>
  </TabsList>
  <TabsContent value="scanner">
  <div style={{ marginLeft: "40px", marginRight: "40px" }}>
      <div className="pt-4" style={{ marginBottom: "20px" }}>
        <ScannerStats
          onScan={startScan}
          scanCount={ips.length}
          underhashingCount={ips.filter((e) => e.is_underhashing).length}
          lessThan3Count={ips.filter((e) => e.hb_count < 3).length}
          missingFanCount={ips.filter((e) => e.fan_count < 4).length}
          notFoundCount={total - ips.length}
          psuFailureCount={ips.filter((e) => e.psu_failure).length}
        />
        <div className="pt-10 flex item-center justify-center">
          {progress != null && (
            <Progress
              indicatorColor={"bg-orange-500"}
              value={progress}
              className="w-[60%]"
            />
          )}
        </div>
      </div>

      <ScanTable scannedIps={ips} />
      <Separator className="mt-8 mb-8" style={{ backgroundColor: "#e94d1b"}}/>
      <Commands />
    </div>
  </TabsContent>
  <TabsContent value="reporter">
  <div className="flex flex-col h-screen overflow-hidden">

      <div className="flex items-center justify-center" id="logo-container">
        <img  alt="Logo" className="max-w-sm p-5"/>
      </div>
      <div className="flex items-center justify-center" id="header-text">
        <p>Currently listening for ASIC IP Addresses. Press the IP Report button on your miner, and check the table below.</p>
        <span className="blinking-circle"></span>
      </div>
      <div className="flex items-center justify-center pt-5" id="header-text">
        <p>(Port 14235 = Antminer) & (Port 8888 = Whatsminer) & (Port 12345 = Aurdaine)</p>
      </div>
      <div className="flex items-center justify-center p-5" id="button-section">
        <Button className="m-2" style={{ background: 'linear-gradient(90deg, hsla(4, 93%, 67%, 1) 0%, hsla(29, 86%, 52%, 1) 100%)', border: 'none', color: 'white' }}>
          Skip Row
        </Button>
        <Button className="m-2" style={{ background: 'linear-gradient(90deg, hsla(4, 93%, 67%, 1) 0%, hsla(29, 86%, 52%, 1) 100%)', border: 'none', color: 'white' }}>
          Clear List
        </Button>
        <Button className="m-2"  style={{ background: 'linear-gradient(90deg, hsla(4, 93%, 67%, 1) 0%, hsla(29, 86%, 52%, 1) 100%)', border: 'none', color: 'white' }}>
          Export List
        </Button>
      </div>
      <div className="flex items-center justify-center p-10 overflow-y-auto max-h-96"> {/* Added overflow-y-auto and max-h-96 */}
        <div className="max-w-2xl w-full">
          <Table className="w-full">
            <TableHeader style={{backgroundColor: "black"}}>
              <TableRow>
                <TableHead className="text-center w-[100px]">ID</TableHead>
                <TableHead className="text-center">IP</TableHead>
                <TableHead className="text-center">MAC</TableHead>
                <TableHead className="text-center">Port</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              
                <TableRow >
                  <TableCell className="text-center font-medium">{}</TableCell>
                  <TableCell className="text-center">
                    <a href={`http://root:root@`} target="_blank" rel="noopener noreferrer">{}</a>
                  </TableCell>
                  <TableCell className="text-center">{}</TableCell>
                  <TableCell className="text-center">{}</TableCell>
                </TableRow>
              
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </TabsContent>
</Tabs>
  );
}
