"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"
import {
    get_speed_dating_compatibility,
    get_user_for_speed_dating
} from 'meetings/speed_dating';
import { User } from '../../types';

const SpeedDating = () => {
    const [userId1, setUserId1] = useState<number | null>(null);
    const [userId2, setUserId2] = useState<number | null>(null);
    const [compatibility, setCompatibility] = useState<number | null>(null);
    const [usersForDating, setUsersForDating] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchUsersForDating = async () => {
        try {
          const users = await get_user_for_speed_dating();
          setUsersForDating(users);
        } catch (err: any) {
          setError(err.message || "Failed to fetch users for speed dating.");
        }
      };
      fetchUsersForDating();
    }, []);
  
    const calculateCompatibility = async () => {
      if (userId1 === null || userId2 === null) {
        setError("Please enter both user IDs.");
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const compatibilityRate = await get_speed_dating_compatibility(userId1, userId2);
        setCompatibility(compatibilityRate);
      } catch (err: any) {
        setError(err.message || "Failed to calculate compatibility.");
        setCompatibility(null);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Speed Dating Compatibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <Label htmlFor="userId1">User ID 1</Label>
                <Input id="userId1" type="number" placeholder="Enter User ID 1" value={userId1 ?? ''} onChange={(e) => setUserId1(e.target.value === '' ? null : Number(e.target.value))} />
                <Label htmlFor="userId2">User ID 2</Label>
                <Input id="userId2" type="number" placeholder="Enter User ID 2" value={userId2 ?? ''} onChange={(e) => setUserId2(e.target.value === '' ? null : Number(e.target.value))} />
              </div>
              <Button disabled={loading} onClick={calculateCompatibility}>
                {loading ? "Calculating..." : "Calculate Compatibility"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
              {compatibility !== null && <p className="text-lg font-semibold">Compatibility Rate: {compatibility.toFixed(2)}</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle>Users for Speed Dating</CardTitle>
          </CardHeader>
          <CardContent>
            {usersForDating.length > 0 ? (
              <ul>
                {usersForDating.map((user) => (
                  <li key={user.id} className="mb-2">User ID: {user.id}</li>
                ))}
              </ul>
            ) : (
              <p>No users currently available for speed dating.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default SpeedDating;
