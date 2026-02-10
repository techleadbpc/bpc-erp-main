"use client";

import { Link } from "react-router-dom";
import { Package, Layers, FileText, Ruler } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    itemGroups: 0,
    items: 0,
    units: 0,
    requisitions: 0,
  });

  useEffect(() => {
    // Get counts from localStorage
    const itemGroups = JSON.parse(localStorage.getItem("itemGroups")) || [];
    const items = JSON.parse(localStorage.getItem("items")) || [];
    const units = JSON.parse(localStorage.getItem("units")) || [];
    const requisitions = JSON.parse(localStorage.getItem("requisitions")) || [];

    setStats({
      itemGroups: itemGroups.length,
      items: items.length,
      units: units.length,
      requisitions: requisitions.length,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button>
            <Link to="/requisitions/new">Create Requisition</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Groups</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.itemGroups}</div>
            <p className="text-xs text-muted-foreground">
              Total item groups in the system
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              <Link to="/item-groups">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.items}</div>
            <p className="text-xs text-muted-foreground">
              Total items in inventory
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              <Link to="/items">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Measurement Units
            </CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.units}</div>
            <p className="text-xs text-muted-foreground">
              Total measurement units
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              <Link to="/units">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisitions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.requisitions}</div>
            <p className="text-xs text-muted-foreground">
              Total material requisitions
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              <Link to="/requisitions">View all</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start">
              <Link to="/item-groups/new" className="flex">
                <Layers className="mr-2 h-4 w-4" />
                <p>Create New Item Group</p>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start">
              <Link to="/items/new" className="flex">
                <Package className="mr-2 h-4 w-4" />
                <p>Add New Item</p>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start">
              <Link to="/units/new" className="flex">
                <Ruler className="mr-2 h-4 w-4" />
                <p>Add Measurement Unit</p>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start">
              <Link to="/requisitions/new" className="flex">
                <FileText className="mr-2 h-4 w-4" />
                <p>Create Material Requisition</p>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Inventory Management System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to the Inventory Management System. This system helps you
              manage:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Item Groups - Categorize your inventory items</li>
              <li>Items - Manage individual inventory items</li>
              <li>Measurement Units - Define units for your items</li>
              <li>
                Material Requisitions - Create and track material requests
              </li>
            </ul>
            <p>
              Use the navigation menu to access different sections of the
              system.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
