import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type ApiConfig } from "@shared/schema";

interface ApiSetupProps {
  onConfigured: () => void;
}

export function ApiSetup({ onConfigured }: ApiSetupProps) {
  const [apiId, setApiId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const testConnectionMutation = useMutation({
    mutationFn: async (config: ApiConfig) => {
      const response = await apiRequest("POST", "/api/test-connection", config);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API connection successful!",
      });
      onConfigured();
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = () => {
    if (!apiId.trim() || !apiKey.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API ID and API Key",
        variant: "destructive",
      });
      return;
    }

    testConnectionMutation.mutate({ apiId: apiId.trim(), apiKey: apiKey.trim() });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="w-5 h-5 mr-2" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="api-id">API ID</Label>
            <Input
              id="api-id"
              type="text"
              placeholder="Enter your VictorOps API ID"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              data-testid="input-api-id"
            />
          </div>
          <div>
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your VictorOps API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              data-testid="input-api-key"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={handleTestConnection}
            disabled={testConnectionMutation.isPending}
            data-testid="button-test-connection"
          >
            {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
