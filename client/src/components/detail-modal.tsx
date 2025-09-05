import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { type Incident } from "@shared/schema";

interface DetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailModal({ incident, isOpen, onClose }: DetailModalProps) {
  if (!incident) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSeverityBadge = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("critical")) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
    } else if (lowerMessage.includes("warning")) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>;
    }
  };

  const calculateResponseTime = () => {
    if (!incident.ackTime) return null;
    
    const start = new Date(incident.startTime);
    const ack = new Date(incident.ackTime);
    const minutes = Math.round((ack.getTime() - start.getTime()) / (1000 * 60));
    
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hours ${remainingMinutes} minutes` : `${hours} hours`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-incident-details">
        <DialogHeader>
          <DialogTitle>Incident Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Incident ID</Label>
            <p className="text-foreground" data-testid="text-incident-id">{incident.incidentNumber}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Entity</Label>
            <p className="text-foreground" data-testid="text-entity-name">
              {incident.entityDisplayName || incident.entityId}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <p className="text-foreground" data-testid="text-description">{incident.stateMessage}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Severity</Label>
            <div data-testid="badge-severity">{getSeverityBadge(incident.stateMessage)}</div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
            <p className="text-foreground capitalize" data-testid="text-status">{incident.currentPhase}</p>
          </div>

          {incident.service && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Service</Label>
              <p className="text-foreground" data-testid="text-service">{incident.service}</p>
            </div>
          )}

          {incident.host && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Host</Label>
              <p className="text-foreground" data-testid="text-host">{incident.host}</p>
            </div>
          )}

          {incident.teams && incident.teams.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Affected Teams</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {incident.teams.map((team, index) => (
                  <Badge key={index} variant="outline" data-testid={`badge-team-${index}`}>
                    {team}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
            <div className="space-y-2 text-sm mt-2">
              <div className="flex justify-between">
                <span>Incident triggered</span>
                <span className="text-muted-foreground" data-testid="text-start-time">
                  {formatTimestamp(incident.startTime)}
                </span>
              </div>
              
              {incident.ackTime && (
                <>
                  <div className="flex justify-between">
                    <span>Acknowledged</span>
                    <span className="text-muted-foreground" data-testid="text-ack-time">
                      {formatTimestamp(incident.ackTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response time</span>
                    <span className="text-muted-foreground" data-testid="text-response-time">
                      {calculateResponseTime()}
                    </span>
                  </div>
                </>
              )}
              
              {incident.endTime && (
                <div className="flex justify-between">
                  <span>Incident resolved</span>
                  <span className="text-muted-foreground" data-testid="text-end-time">
                    {formatTimestamp(incident.endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {incident.ackUserId && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Acknowledged By</Label>
              <p className="text-foreground" data-testid="text-ack-user">{incident.ackUserId}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
