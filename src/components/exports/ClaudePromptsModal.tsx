"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  CheckCircle, 
  X, 
  Brain, 
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface ClaudePromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportResult: {
    filename: string;
    location: string;
    prompts: {
      comprehensive: string;
      focused: {
        gut: string;
        metabolic: string;
        hormonal: string;
      };
      followup: string;
    };
    clientContext: {
      name: string;
      primaryConcerns: string;
      medications: string[];
      keyLabs: string;
    };
  };
}

export function ClaudePromptsModal({ 
  isOpen, 
  onClose, 
  exportResult 
}: ClaudePromptsModalProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("comprehensive");

  const copyToClipboard = async (text: string, promptType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(promptType);
      toast.success("Prompt copied to clipboard!", {
        description: "Ready to paste into Claude Desktop",
        duration: 3000,
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopiedPrompt(null), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy prompt", {
        description: "Please select and copy manually",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">
                Claude Desktop Analysis Prompts
              </h2>
              <p className="text-blue-100 text-sm">
                Ready-to-paste prompts for {exportResult.clientContext.name}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Export File:</p>
              <p className="text-white font-medium">{exportResult.filename}</p>
            </div>
            <div>
              <p className="text-gray-400">Location:</p>
              <p className="text-white font-medium text-xs">{exportResult.location}</p>
            </div>
          </div>
        </div>

        {/* Client Context Summary */}
        <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-400">Primary Concerns:</p>
              <p className="text-blue-300">{exportResult.clientContext.primaryConcerns}</p>
            </div>
            <div>
              <p className="text-gray-400">Medications:</p>
              <p className="text-green-300">
                {exportResult.clientContext.medications.length > 0 
                  ? exportResult.clientContext.medications.join(", ")
                  : "None"
                }
              </p>
            </div>
            <div>
              <p className="text-gray-400">Key Labs:</p>
              <p className="text-purple-300">{exportResult.clientContext.keyLabs}</p>
            </div>
          </div>
        </div>

        {/* Prompt Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none p-1">
              <TabsTrigger 
                value="comprehensive" 
                className="flex items-center space-x-2 data-[state=active]:bg-blue-600"
              >
                <Brain className="w-4 h-4" />
                <span>Comprehensive</span>
              </TabsTrigger>
              <TabsTrigger 
                value="followup" 
                className="flex items-center space-x-2 data-[state=active]:bg-orange-600"
              >
                <FileText className="w-4 h-4" />
                <span>Follow-up</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="comprehensive" className="h-full p-0 m-0">
                <PromptDisplay
                  prompt={exportResult.prompts.comprehensive}
                  promptType="comprehensive"
                  title="Comprehensive Analysis"
                  description="Complete functional medicine analysis with 3-phase protocol"
                  onCopy={copyToClipboard}
                  isCopied={copiedPrompt === "comprehensive"}
                />
              </TabsContent>


              <TabsContent value="followup" className="h-full p-0 m-0">
                <PromptDisplay
                  prompt={exportResult.prompts.followup}
                  promptType="followup"
                  title="Follow-up Analysis"
                  description="Progress review and protocol adjustment"
                  onCopy={copyToClipboard}
                  isCopied={copiedPrompt === "followup"}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              💡 Copy any prompt above and paste into Claude Desktop for analysis
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PromptDisplayProps {
  prompt: string;
  promptType: string;
  title: string;
  description: string;
  onCopy: (text: string, type: string) => void;
  isCopied: boolean;
}

function PromptDisplay({ 
  prompt, 
  promptType, 
  title, 
  description, 
  onCopy, 
  isCopied 
}: PromptDisplayProps) {
  const [editablePrompt, setEditablePrompt] = useState(prompt);

  // Update editable prompt when prop changes
  useEffect(() => {
    setEditablePrompt(prompt);
  }, [prompt]);

  const handleCopy = () => {
    onCopy(editablePrompt, promptType);
  };

  const handleReset = () => {
    setEditablePrompt(prompt);
    toast.info("Prompt reset to original");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Prompt Header */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              Reset
            </Button>
            <Button
              onClick={handleCopy}
              className={`flex items-center space-x-2 ${
                isCopied 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              size="sm"
            >
              {isCopied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Editable Prompt Content */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex-1 flex flex-col">
          <textarea
            value={editablePrompt}
            onChange={(e) => setEditablePrompt(e.target.value)}
            className="flex-1 w-full bg-transparent text-gray-300 text-sm font-mono leading-relaxed resize-none border-none outline-none placeholder-gray-500 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
            placeholder="Claude Desktop prompt will appear here..."
            style={{ minHeight: '400px' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Prompt is editable - modify as needed before copying to Claude Desktop
        </p>
      </div>
    </div>
  );
}
