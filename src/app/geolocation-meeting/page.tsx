"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { get_meeting_compatibility } from "@/../meetings/geolocation_meetings"; // Adjust the import path as necessary
import { useToast } from "@/hooks/use-toast";

export default function GeolocationMeeting() {
  const [userId1, setUserId1] = useState('');
  const [userId2, setUserId2] = useState('');
  const [compatibility, setCompatibility] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateCompatibility = async () => {
    setLoading(true);
    setCompatibility(null);

    try {
      const compatibilityRate = await get_meeting_compatibility(userId1, userId2);
      setCompatibility(compatibilityRate);
      toast({
        title: "Compatibility Calculated",
        description: `The compatibility rate between user ${userId1} and user ${userId2} is ${compatibilityRate.toFixed(2)}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to calculate compatibility.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Geolocation Meeting Compatibility</CardTitle>
          <CardDescription>Enter the user IDs to calculate compatibility for a geolocation-based meeting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId1">User ID 1</Label>
            <Input
              id="userId1"
              placeholder="Enter User ID 1"
              value={userId1}
              onChange={(e) => setUserId1(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId2">User ID 2</Label>
            <Input
              id="userId2"
              placeholder="Enter User ID 2"
              value={userId2}
              onChange={(e) => setUserId2(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={calculateCompatibility} disabled={loading}>
            {loading ? "Calculating..." : "Calculate Compatibility"}
          </Button>
        </CardFooter>
        {compatibility !== null && (
          <CardContent>
            <div className="mt-4 p-4 rounded-md bg-green-100 text-green-800">
              <p className="font-bold">Compatibility Result</p>
              <p>
                The compatibility rate between user {userId1} and user {userId2} is:{" "}
                <span className="font-semibold">{(compatibility * 100).toFixed(2)}%</span>
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
