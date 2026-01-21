import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { PartnerConfig } from '../../types';
import { Building, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

interface PartnerCardProps {
  partner: PartnerConfig;
  onEdit?: (partner: PartnerConfig) => void;
  onView?: (partner: PartnerConfig) => void;
}

export function PartnerCard({ partner, onEdit, onView }: PartnerCardProps) {
  const getStatusVariant = (status: PartnerConfig['status']) => {
    const variants = {
      active: 'default' as const,
      inactive: 'secondary' as const,
      pending: 'outline' as const,
      suspended: 'destructive' as const,
    };
    return variants[status];
  };

  const getTypeLabel = (type: PartnerConfig['type']) => {
    const labels = {
      payment_processor: 'Payment Processor',
      acquirer: 'Acquirer',
      gateway: 'Gateway',
      merchant: 'Merchant',
      bank: 'Bank',
    };
    return labels[type];
  };

  const getFrequencyLabel = (freq: PartnerConfig['settlementFrequency']) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
    };
    return labels[freq];
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{partner.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{partner.code}</Badge>
              <Badge variant="secondary">{getTypeLabel(partner.type)}</Badge>
              <Badge variant={getStatusVariant(partner.status)}>
                {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{partner.contactEmail}</span>
          </div>
          
          {partner.contactPhone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{partner.contactPhone}</span>
            </div>
          )}
          
          {partner.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{partner.address}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Settlement: {getFrequencyLabel(partner.settlementFrequency)}</span>
          </div>
          
          {partner.feePercentage !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Fee: {partner.feePercentage}%</span>
            </div>
          )}
        </div>

        {partner.contactName && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              Contact: <span className="font-medium text-foreground">{partner.contactName}</span>
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-3">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(partner)} className="flex-1">
              View Details
            </Button>
          )}
          {onEdit && (
            <Button variant="default" size="sm" onClick={() => onEdit(partner)} className="flex-1">
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
