"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast"; // Assuming you have a toast component
import { Checkbox } from "@/components/ui/checkbox";

type Score = {
  score: number;
  name: string;
  contact: string;
};

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [score, setScore] = useState<number | string>("");
  const [name, setName] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchScores() {
      try {
        const response = await axios.get('/api/scores');
        if (response.data.success) {
          setScores(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    }
    fetchScores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newScore: Score = { score: Number(score), name, contact };
    try {
      const response = await axios.post('/api/scores', newScore);
      if (response.data.success) {
        setScores(response.data.data);
        toast({
          title: "Success",
          description: "Score added successfully.",
        });
        setIsDialogOpen(false); // Close the dialog on success
        setScore("");
        setName("");
        setContact("");
      }
    } catch (error) {
      console.error('Error saving score:', error);
      toast({
        title: "Error",
        description: "Failed to save score.",
        variant: "destructive",
      });
    }
  };

  const getPlaceIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🟠";
  };

  return (
    <>  
    <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#ff9e00", color: "white" }}>
                Add New Score
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Add New Score</DialogTitle>
              <DialogDescription>Enter the details for the new score.</DialogDescription>
              <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="name">Name</label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="contact">Contact</label>
                  <Input id="contact" type="text" value={contact} onChange={(e) => setContact(e.target.value)} required />
                </div>
                <div className="flex flex-col items-center justify-center" style={{ marginBottom: '5px' }}>
                <label htmlFor="contact" className="text-center" style={{color: '#ff9e00'}}>
                  I hereby agree to all liabilities of the Simple Mining Boxing Giveaway Waiver: <a href="https://simplemining.io/Simple%20Mining%20LLC%20Waiver%20and%20Release.pdf" target="_blank" style={{color: '#0077ee'}}><i>View PDF</i></a>
                  {/* style={{color: '#0000EE'}} */}
                </label>
                <br />
                <div style={{ marginTop: '5px' }}>
                  <Checkbox className="w-6 h-6"/>
                </div>
              </div>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="score">Score</label>
                  <Input id="score" type="number" value={score} onChange={(e) => setScore(e.target.value)} required />
                </div>
                <DialogFooter>
                  <Button type="submit" style={{ marginTop: '15px', backgroundColor: "#ff9e00", color: "white" }}>Submit</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
        <img src="/boxing-gloves-btc.png" alt="BTC Boxing Gloves" style={{ width: '330px', height: '330px' }} />
      </div>
  
      <h1 className="flex justify-center items-center text-3xl">Simple Mining - Live Scoreboard</h1>
      {/* <h1 className="flex justify-center items-center text-2xl" style={{ color: "#FF0000"}}>Day 1 OVER - Come Back Tomorrow! :)</h1> */}
      <h1 className="flex justify-center items-center text-3xl" style={{ color: "#ff9e00"}}>1st Place = <b><u>1,000,000 Free Sats</u></b></h1>
      <br />

      <div className="flex justify-center items-center mt-4">
        <div className="max-w-xl w-full">
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-black z-10">
              <TableRow>
                <TableHead className="text-xl text-center w-[100px]">Place</TableHead>
                <TableHead className="text-xl text-center w-[100px]">Score</TableHead>
                <TableHead className="text-xl text-center w-[100px]">Name</TableHead>
                {/* <TableHead className="text-xl text-center w-[100px]">Contact</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score, index) => (
                <TableRow key={index}>
                  <TableCell className="text-3xl text-center w-[100px]">{getPlaceIcon(index)}</TableCell>
                  <TableCell className="text-xl text-center w-[100px]">{score.score}</TableCell>
                  <TableCell className="text-xl text-center w-[100px]">{score.name}</TableCell>
                  {/* <TableCell className="text-xl text-center w-[100px]">{score.contact}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

{/* <TableBody>
  {scores.slice(0, 20).map((score, index) => (
    <TableRow key={index}>
      <TableCell className="text-3xl text-center w-[100px]">{getPlaceIcon(index)}</TableCell>
      <TableCell className="text-xl text-center w-[100px]">{score.score}</TableCell>
      <TableCell className="text-xl text-center w-[100px]">{score.name}</TableCell>
      <TableCell className="text-xl text-center w-[100px]">{score.contact}</TableCell>
    </TableRow>
  ))}
</TableBody> */}