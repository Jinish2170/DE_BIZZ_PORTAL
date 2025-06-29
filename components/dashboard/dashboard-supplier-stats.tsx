"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { Supplier } from "@/lib/store"

export function DashboardSupplierStats() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('/api/suppliers')
        const data = await response.json()
        setSuppliers(data)
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse">
          <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Group suppliers by category
  const suppliersByCategory = suppliers.reduce(
    (acc, supplier) => {
      acc[supplier.category] = (acc[supplier.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Prepare data for pie chart
  const data = Object.entries(suppliersByCategory)
    .map(([category, count]) => ({
      name: category,
      value: count,
    }))
    .sort((a, b) => b.value - a.value)

  // Colors for chart
  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"]

  const textColor = theme === "dark" ? "#f8fafc" : "#334155"

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} suppliers`, undefined]}
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                color: textColor,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="rounded-md border p-3 text-center">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{suppliers.filter((s) => s.status === "active").length}</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold">{suppliers.filter((s) => s.status === "inactive").length}</p>
        </div>
      </div>
    </div>
  )
}
