import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { PartnerCard } from '../../components/admin';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/use-toast';
import { Building2, Plus, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import type { PartnerConfig, CreatePartnerRequest, UpdatePartnerRequest } from '../../types';

export default function PartnerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerConfig | undefined>();
  const [deletePartnerId, setDeletePartnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreatePartnerRequest>>({
    name: '',
    code: '',
    type: 'bank',
    status: 'active',
    contactEmail: '',
    contactPhone: '',
    address: '',
    settlementFrequency: 'daily',
    feePercentage: 0,
    contactName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch partners
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: adminService.getPartners,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getAdminStats,
  });

  // Create partner mutation
  const createMutation = useMutation({
    mutationFn: adminService.createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-partners']);
      queryClient.invalidateQueries(['admin-stats']);
      setShowPartnerDialog(false);
      resetForm();
      toast({
        title: 'Partner Created',
        description: 'The partner has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create partner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update partner mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerRequest }) =>
      adminService.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-partners']);
      setShowPartnerDialog(false);
      setSelectedPartner(undefined);
      resetForm();
      toast({
        title: 'Partner Updated',
        description: 'The partner has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update partner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete partner mutation
  const deleteMutation = useMutation({
    mutationFn: adminService.deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-partners']);
      queryClient.invalidateQueries(['admin-stats']);
      setDeletePartnerId(null);
      toast({
        title: 'Partner Deleted',
        description: 'The partner has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete partner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'bank',
      status: 'active',
      contactEmail: '',
      contactPhone: '',
      address: '',
      settlementFrequency: 'daily',
      feePercentage: 0,
      contactName: '',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = 'Partner name is required';
    if (!formData.code?.trim()) errors.code = 'Partner code is required';
    if (!formData.contactEmail?.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }
    if (formData.feePercentage === undefined || formData.feePercentage < 0) {
      errors.feePercentage = 'Fee percentage must be 0 or greater';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePartner = () => {
    setSelectedPartner(undefined);
    resetForm();
    setShowPartnerDialog(true);
  };

  const handleEditPartner = (partner: PartnerConfig) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      code: partner.code,
      type: partner.type,
      status: partner.status,
      contactEmail: partner.contactEmail,
      contactPhone: partner.contactPhone,
      address: partner.address,
      settlementFrequency: partner.settlementFrequency,
      feePercentage: partner.feePercentage,
      contactName: partner.contactName,
    });
    setFormErrors({});
    setShowPartnerDialog(true);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (selectedPartner) {
      updateMutation.mutate({
        id: selectedPartner.id,
        data: formData as UpdatePartnerRequest,
      });
    } else {
      createMutation.mutate(formData as CreatePartnerRequest);
    }
  };

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      search === '' ||
      partner.name.toLowerCase().includes(search.toLowerCase()) ||
      partner.code.toLowerCase().includes(search.toLowerCase()) ||
      partner.contactEmail.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || partner.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activePartners = partners.filter(p => p.status === 'active').length;
  const inactivePartners = partners.filter(p => p.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partner Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage partner organizations and their configurations
          </p>
        </div>
        <Button onClick={handleCreatePartner}>
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Partners
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPartners || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Partners
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePartners}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Partners
            </CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactivePartners}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partner Types
            </CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(partners.map(p => p.type)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
            <SelectItem value="merchant">Merchant</SelectItem>
            <SelectItem value="payment-gateway">Payment Gateway</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Partners Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading partners...</div>
      ) : filteredPartners.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No partners found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map(partner => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onEdit={handleEditPartner}
            />
          ))}
        </div>
      )}

      {/* Partner Dialog */}
      <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPartner ? 'Edit Partner' : 'Create New Partner'}
            </DialogTitle>
            <DialogDescription>
              {selectedPartner
                ? 'Update partner information and configuration'
                : 'Add a new partner organization'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Partner Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Chase Bank"
                value={formData.name}
                onChange={e => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setFormErrors(prev => ({ ...prev, name: '' }));
                }}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Partner Code *</Label>
              <Input
                id="code"
                placeholder="e.g., CHASE"
                value={formData.code}
                onChange={e => {
                  setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }));
                  setFormErrors(prev => ({ ...prev, code: '' }));
                }}
              />
              {formErrors.code && (
                <p className="text-sm text-red-600">{formErrors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, type: value as PartnerConfig['type'] }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="merchant">Merchant</SelectItem>
                  <SelectItem value="payment-gateway">Payment Gateway</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, status: value as PartnerConfig['status'] }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="e.g., John Doe"
                value={formData.contactName}
                onChange={e =>
                  setFormData(prev => ({ ...prev, contactName: e.target.value }))
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="e.g., contact@chase.com"
                value={formData.contactEmail}
                onChange={e => {
                  setFormData(prev => ({ ...prev, contactEmail: e.target.value }));
                  setFormErrors(prev => ({ ...prev, contactEmail: '' }));
                }}
              />
              {formErrors.contactEmail && (
                <p className="text-sm text-red-600">{formErrors.contactEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                placeholder="e.g., +1 555-1234"
                value={formData.contactPhone}
                onChange={e =>
                  setFormData(prev => ({ ...prev, contactPhone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settlementFrequency">Settlement Frequency *</Label>
              <Select
                value={formData.settlementFrequency}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    settlementFrequency: value as PartnerConfig['settlementFrequency'],
                  }))
                }
              >
                <SelectTrigger id="settlementFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Main St, New York, NY 10001"
                value={formData.address}
                onChange={e =>
                  setFormData(prev => ({ ...prev, address: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feePercentage">Fee Percentage *</Label>
              <Input
                id="feePercentage"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 2.5"
                value={formData.feePercentage}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    feePercentage: parseFloat(e.target.value) || 0,
                  }));
                  setFormErrors(prev => ({ ...prev, feePercentage: '' }));
                }}
              />
              {formErrors.feePercentage && (
                <p className="text-sm text-red-600">{formErrors.feePercentage}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPartnerDialog(false);
                setSelectedPartner(undefined);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {selectedPartner ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePartnerId} onOpenChange={() => setDeletePartnerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this partner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePartnerId && deleteMutation.mutate(deletePartnerId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
