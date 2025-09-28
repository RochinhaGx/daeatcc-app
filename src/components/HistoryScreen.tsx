import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Filter, Download } from "lucide-react";

const HistoryScreen = () => {
  // Dados simulados para o gráfico
  const chartData = [
    { time: "00:00", humidity: 45, waterLevel: 0.8 },
    { time: "04:00", humidity: 52, waterLevel: 1.2 },
    { time: "08:00", humidity: 48, waterLevel: 0.9 },
    { time: "12:00", humidity: 65, waterLevel: 2.3 },
    { time: "16:00", humidity: 58, waterLevel: 1.8 },
    { time: "20:00", humidity: 62, waterLevel: 2.1 },
  ];

  const maxHumidity = Math.max(...chartData.map(d => d.humidity));
  const maxWaterLevel = Math.max(...chartData.map(d => d.waterLevel));

  return (
    <div className="w-full p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">Dados dos sensores</p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Seletor de período */}
      <Card className="card-daea mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Período</h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="text-xs">24h</Button>
          <Button className="text-xs">7 dias</Button>
          <Button variant="outline" size="sm" className="text-xs">30 dias</Button>
        </div>
      </Card>

      {/* Gráfico simulado */}
      <Card className="card-daea mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Evolução dos Sensores</h3>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        
        {/* Legenda */}
        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Umidade (%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Nível Água (cm)</span>
          </div>
        </div>

        {/* Gráfico SVG simplificado */}
        <div className="h-48 bg-muted/20 rounded-lg p-4 relative">
          <svg viewBox="0 0 400 140" className="w-full h-full">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 35}
                x2="400"
                y2={i * 35}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
            
            {/* Linha de umidade */}
            <path
              d={`M ${chartData.map((d, i) => 
                `${(i / (chartData.length - 1)) * 360 + 20},${140 - (d.humidity / maxHumidity) * 120}`
              ).join(' L ')}`}
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Linha de nível da água */}
            <path
              d={`M ${chartData.map((d, i) => 
                `${(i / (chartData.length - 1)) * 360 + 20},${140 - (d.waterLevel / maxWaterLevel) * 120}`
              ).join(' L ')}`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Pontos */}
            {chartData.map((d, i) => (
              <g key={i}>
                <circle
                  cx={(i / (chartData.length - 1)) * 360 + 20}
                  cy={140 - (d.humidity / maxHumidity) * 120}
                  r="3"
                  fill="rgb(59, 130, 246)"
                />
                <circle
                  cx={(i / (chartData.length - 1)) * 360 + 20}
                  cy={140 - (d.waterLevel / maxWaterLevel) * 120}
                  r="3"
                  fill="hsl(var(--primary))"
                />
              </g>
            ))}
          </svg>
          
          {/* Eixo X */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {chartData.map((d, i) => (
              <span key={i}>{d.time}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="card-daea text-center">
          <p className="text-2xl font-bold text-blue-500">65%</p>
          <p className="text-sm text-muted-foreground">Umidade Máx</p>
          <p className="text-xs text-muted-foreground">Hoje</p>
        </Card>
        <Card className="card-daea text-center">
          <p className="text-2xl font-bold text-primary">2.3cm</p>
          <p className="text-sm text-muted-foreground">Água Máx</p>
          <p className="text-xs text-muted-foreground">Hoje</p>
        </Card>
      </div>

      {/* Exportar dados */}
      <Card className="card-daea">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Exportar Relatório</h3>
            <p className="text-sm text-muted-foreground">Baixar dados do período</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HistoryScreen;