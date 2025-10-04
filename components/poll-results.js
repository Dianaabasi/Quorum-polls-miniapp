"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#8E44EC", "#DA70D6", "#1A1A2E", "#A855F7", "#C084FC"]

export function PollResults({ poll, selectedOption }) {
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0

  // Prepare data for chart
  const chartData = poll.options?.map((option, index) => ({
    name: option.text,
    value: option.votes || 0,
    percentage: totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0,
  }))

  const winner = poll.options?.reduce((prev, current) => ((current.votes || 0) > (prev.votes || 0) ? current : prev))

  return (
    <div className="space-y-6">
      {/* Bar Chart Results */}
      <div className="space-y-4">
        {poll.options?.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const isSelected = selectedOption === index
          const isWinner = option.text === winner?.text && totalVotes > 0

          return (
            <div
              key={index}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : isWinner
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-background"
              }`}
            >
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">{option.text}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {isWinner && totalVotes > 0 && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{option.votes || 0} votes</span>
                  <span className="text-lg font-bold text-foreground">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Pie Chart Visualization */}
      {totalVotes > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Vote Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-foreground font-medium">{payload[0].name}</p>
                        <p className="text-muted-foreground text-sm">
                          {payload[0].value} votes ({payload[0].payload.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats Summary */}
      {totalVotes > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalVotes}</div>
            <div className="text-sm text-muted-foreground">Total Votes</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{poll.options?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Options</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-secondary truncate">{winner?.text || "N/A"}</div>
            <div className="text-sm text-muted-foreground">Leading Option</div>
          </div>
        </div>
      )}
    </div>
  )
}
