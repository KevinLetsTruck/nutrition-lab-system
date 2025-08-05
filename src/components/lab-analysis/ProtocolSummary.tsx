'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Pill, 
  Apple, 
  Dumbbell, 
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Protocol {
  id: string
  protocol_type: string
  priority: string
  title: string
  description: string
  supplement_protocol?: any
  dietary_modifications?: any[]
  lifestyle_interventions?: any[]
  retest_schedule?: any
  truck_driver_adaptations?: string
  created_at: string
}

interface ProtocolSummaryProps {
  protocols: Protocol[]
}

export default function ProtocolSummary({ protocols }: ProtocolSummaryProps) {
  const protocolsByType = {
    supplement: protocols.filter(p => p.protocol_type === 'supplement'),
    dietary: protocols.filter(p => p.protocol_type === 'dietary'),
    lifestyle: protocols.filter(p => p.protocol_type === 'lifestyle'),
    retest: protocols.filter(p => p.protocol_type === 'retest')
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      immediate: 'destructive',
      short_term: 'warning',
      long_term: 'secondary'
    }
    return (
      <Badge variant={variants[priority] || 'outline'}>
        {priority.replace('_', ' ')}
      </Badge>
    )
  }

  if (!protocols.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No protocols generated yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete lab analysis to receive personalized protocols
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="supplement" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="supplement" className="flex items-center gap-2">
          <Pill className="h-4 w-4" />
          Supplements ({protocolsByType.supplement.length})
        </TabsTrigger>
        <TabsTrigger value="dietary" className="flex items-center gap-2">
          <Apple className="h-4 w-4" />
          Dietary ({protocolsByType.dietary.length})
        </TabsTrigger>
        <TabsTrigger value="lifestyle" className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4" />
          Lifestyle ({protocolsByType.lifestyle.length})
        </TabsTrigger>
        <TabsTrigger value="retest" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Retest ({protocolsByType.retest.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="supplement" className="space-y-4">
        {protocolsByType.supplement.map(protocol => (
          <Card key={protocol.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{protocol.title}</CardTitle>
                  <CardDescription>{protocol.description}</CardDescription>
                </div>
                {getPriorityBadge(protocol.priority)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocol.supplement_protocol?.supplements?.map((supp: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{supp.name}</h4>
                      <p className="text-sm text-muted-foreground">{supp.rationale}</p>
                    </div>
                    <Badge variant="outline">{supp.source}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="font-medium">Dosage</p>
                      <p className="text-muted-foreground">{supp.dosage}</p>
                    </div>
                    <div>
                      <p className="font-medium">Frequency</p>
                      <p className="text-muted-foreground">{supp.frequency}</p>
                    </div>
                    <div>
                      <p className="font-medium">Timing</p>
                      <p className="text-muted-foreground">{supp.timing}</p>
                    </div>
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">{supp.duration}</p>
                    </div>
                  </div>

                  {supp.product_recommendation && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Recommended: {supp.product_recommendation}</span>
                    </div>
                  )}

                  {supp.precautions && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{supp.precautions}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}

              {protocol.supplement_protocol?.total_monthly_cost && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">Estimated Monthly Cost:</span>
                  </div>
                  <span className="text-lg font-bold">${protocol.supplement_protocol.total_monthly_cost}</span>
                </div>
              )}

              {protocol.truck_driver_adaptations && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Truck Driver Note:</strong> {protocol.truck_driver_adaptations}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="dietary" className="space-y-4">
        {protocolsByType.dietary.map(protocol => (
          <Card key={protocol.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{protocol.title}</CardTitle>
                  <CardDescription>{protocol.description}</CardDescription>
                </div>
                {getPriorityBadge(protocol.priority)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocol.dietary_modifications?.map((mod: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold">{mod.category}</h4>
                  <p className="text-sm">{mod.recommendation}</p>
                  
                  {mod.truck_driver_friendly && (
                    <Badge variant="success">Truck Driver Friendly</Badge>
                  )}

                  {mod.alternatives && mod.alternatives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Practical Alternatives:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {mod.alternatives.map((alt: string, altIdx: number) => (
                          <li key={altIdx}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {mod.meal_timing && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Timing: {mod.meal_timing}</span>
                    </div>
                  )}
                </div>
              ))}

              {protocol.truck_driver_adaptations && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Truck Driver Note:</strong> {protocol.truck_driver_adaptations}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="lifestyle" className="space-y-4">
        {protocolsByType.lifestyle.map(protocol => (
          <Card key={protocol.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{protocol.title}</CardTitle>
                  <CardDescription>{protocol.description}</CardDescription>
                </div>
                {getPriorityBadge(protocol.priority)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocol.lifestyle_interventions?.map((intervention: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold capitalize">{intervention.area}</h4>
                    <Badge variant={intervention.priority === 'high' ? 'destructive' : 'secondary'}>
                      {intervention.priority} priority
                    </Badge>
                  </div>
                  
                  <p className="text-sm">{intervention.recommendation}</p>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Truck Cab Adaptation:</p>
                    <p className="text-sm text-muted-foreground">{intervention.truck_cab_adaptation}</p>
                  </div>
                </div>
              ))}

              {protocol.truck_driver_adaptations && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Truck Driver Note:</strong> {protocol.truck_driver_adaptations}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="retest" className="space-y-4">
        {protocolsByType.retest.map(protocol => (
          <Card key={protocol.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{protocol.title}</CardTitle>
                  <CardDescription>{protocol.description}</CardDescription>
                </div>
                {getPriorityBadge(protocol.priority)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocol.retest_schedule && (
                <div className="space-y-4">
                  {protocol.retest_schedule.urgent_retest?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Urgent Retest (ASAP)</h4>
                      <div className="flex flex-wrap gap-2">
                        {protocol.retest_schedule.urgent_retest.map((test: string) => (
                          <Badge key={test} variant="destructive">{test}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {protocol.retest_schedule.three_month_retest?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-2">3-Month Retest</h4>
                      <div className="flex flex-wrap gap-2">
                        {protocol.retest_schedule.three_month_retest.map((test: string) => (
                          <Badge key={test} variant="warning">{test}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {protocol.retest_schedule.six_month_retest?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">6-Month Retest</h4>
                      <div className="flex flex-wrap gap-2">
                        {protocol.retest_schedule.six_month_retest.map((test: string) => (
                          <Badge key={test} variant="secondary">{test}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {protocol.retest_schedule.annual_retest?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Annual Retest</h4>
                      <div className="flex flex-wrap gap-2">
                        {protocol.retest_schedule.annual_retest.map((test: string) => (
                          <Badge key={test} variant="outline">{test}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {protocol.truck_driver_adaptations && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Truck Driver Note:</strong> {protocol.truck_driver_adaptations}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  )
}