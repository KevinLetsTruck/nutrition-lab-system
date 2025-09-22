'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pill, 
  Clock, 
  Target, 
  TrendingUp,
  ExternalLink,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Calendar,
  Truck
} from 'lucide-react';

interface ProtocolDisplayProps {
  analysis: any; // Analysis record with parsedProtocol
  clientName: string;
}

export function ProtocolDisplay({ analysis, clientName }: ProtocolDisplayProps) {
  const [activePhase, setActivePhase] = useState(0);
  const protocol = analysis.parsedProtocol;

  if (!protocol || !protocol.phases || protocol.phases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No structured protocol found in this analysis</p>
          <p className="text-sm text-gray-500">Import a Claude Desktop protocol to see structured recommendations</p>
        </CardContent>
      </Card>
    );
  }

  const currentPhase = protocol.phases[activePhase];
  const totalSupplements = protocol.supplements?.length || 0;
  const letstruckProducts = protocol.supplements?.filter((s: any) => s.letstruck_sku)?.length || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Protocol Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Protocol Overview for {clientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{protocol.phases?.length || 0}</div>
              <div className="text-sm text-gray-600">Protocol Phases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalSupplements}</div>
              <div className="text-sm text-gray-600">Total Supplements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{letstruckProducts}</div>
              <div className="text-sm text-gray-600">LetsTruck Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{protocol.coachingNotes?.length || 0}</div>
              <div className="text-sm text-gray-600">Coaching Notes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Navigation */}
      {protocol.phases && protocol.phases.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              {protocol.phases.map((phase: any, index: number) => (
                <Button
                  key={index}
                  variant={activePhase === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePhase(index)}
                  className="flex items-center gap-2"
                >
                  <span className="font-medium">{phase.name || `Phase ${index + 1}`}</span>
                  <span className="text-xs opacity-75">({phase.duration || '30 days'})</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Phase Details */}
      {currentPhase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {currentPhase.name || `Phase ${activePhase + 1}`}
              <Badge variant="outline">{currentPhase.duration || '30 days'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Phase Goals */}
            {currentPhase.goals && currentPhase.goals.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Phase Goals
                </h4>
                <ul className="space-y-2">
                  {currentPhase.goals.map((goal: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supplements for this Phase */}
            {protocol.supplements && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Supplements ({protocol.supplements.filter((s: any) => s.phase === (activePhase + 1).toString()).length})
                </h4>
                <div className="space-y-3">
                  {protocol.supplements
                    .filter((s: any) => s.phase === (activePhase + 1).toString())
                    .map((supplement: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">{supplement.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(supplement.priority)}>
                              {supplement.priority}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {supplement.dosage} • {supplement.timing}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {supplement.letstruck_sku && (
                            <Button size="sm" variant="outline" className="text-xs">
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              LetsTruck
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{supplement.purpose}</p>
                      
                      {supplement.trucker_instructions && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-blue-800">Trucker Instructions:</p>
                              <p className="text-xs text-blue-700">{supplement.trucker_instructions}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Product Options */}
                      <div className="mt-3 space-y-1">
                        {supplement.letstruck_sku && (
                          <div className="text-xs text-green-700">
                            <strong>LetsTruck:</strong> {supplement.letstruck_sku}
                          </div>
                        )}
                        {supplement.biotiics_alternative && (
                          <div className="text-xs text-blue-700">
                            <strong>Biotiics:</strong> {supplement.biotiics_alternative}
                          </div>
                        )}
                        {supplement.fullscript_backup && (
                          <div className="text-xs text-gray-700">
                            <strong>FullScript:</strong> {supplement.fullscript_backup}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Criteria */}
            {currentPhase.successCriteria && currentPhase.successCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Success Criteria
                </h4>
                <ul className="space-y-2">
                  {currentPhase.successCriteria.map((criteria: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Coaching Notes */}
      {protocol.coachingNotes && protocol.coachingNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Coaching Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {protocol.coachingNotes.map((note: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{note.category}</Badge>
                    <Badge className={getPriorityColor(note.priority)}>{note.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
