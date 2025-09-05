import { useState } from "react";
import { List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Incident } from "@shared/schema";

interface CalloutDetailsProps {
  incidents: Incident[];
  onViewDetails: (incident: Incident) => void;
}

export function CalloutDetails({ incidents, onViewDetails }: CalloutDetailsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(incidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIncidents = incidents.slice(startIndex, startIndex + itemsPerPage);

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const calculateResponseTime = (startTime: string, ackTime?: string) => {
    if (!ackTime) return "N/A";
    
    const start = new Date(startTime);
    const ack = new Date(ackTime);
    const minutes = Math.round((ack.getTime() - start.getTime()) / (1000 * 60));
    
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStatusBadge = (phase: string) => {
    switch (phase.toLowerCase()) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case "acknowledged":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Acknowledged</Badge>;
      case "unacked":
      case "triggered":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Active</Badge>;
      default:
        return <Badge variant="secondary">{phase}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <List className="w-5 h-5 mr-2" />
          OOH Callout Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentIncidents.map((incident) => {
                const { date, time } = formatDateTime(incident.startTime);
                const responseTime = calculateResponseTime(incident.startTime, incident.ackTime);
                
                return (
                  <TableRow key={incident.incidentNumber} data-testid={`row-incident-${incident.incidentNumber}`}>
                    <TableCell>
                      <div className="text-sm">
                        <div>{date}</div>
                        <div className="text-muted-foreground">{time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {incident.entityDisplayName || incident.entityId}
                        </div>
                        <div className="text-muted-foreground truncate max-w-xs">
                          {incident.stateMessage}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{responseTime}</TableCell>
                    <TableCell>{getStatusBadge(incident.currentPhase)}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => onViewDetails(incident)}
                        className="p-0 h-auto"
                        data-testid={`button-view-details-${incident.incidentNumber}`}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, incidents.length)} of {incidents.length} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    data-testid={`button-page-${pageNumber}`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
