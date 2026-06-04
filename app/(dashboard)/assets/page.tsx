'use client';

import { CredentialsAssetsView } from '@/components/SubViews';
import { useAssets, useEmployees, useEmployeeMutations, useUpdateAsset } from '@/features/employees/hooks';

export default function AssetsPage() {
  const { data: employees = [] } = useEmployees();
  const { data: assets = [] } = useAssets();
  const updateAsset = useUpdateAsset();
  const { updateCredential } = useEmployeeMutations();

  return (
    <CredentialsAssetsView
      employees={employees}
      assets={assets}
      onUpdateAsset={asset => updateAsset.mutate(asset)}
      onUpdateCredential={(empId, credId, status) => updateCredential.mutate({ empId, credId, status })}
    />
  );
}
