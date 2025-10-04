import React, { useState, useEffect } from 'react';
import { FloatingSelect } from './FloatingSelect';
import { provinces, getDistrictsByProvince, getWardsByDistrict } from '../../lib/location-data';

interface CascadingLocationSelectProps {
  province?: string;
  district?: string;
  ward?: string;
  onProvinceChange: (province: string) => void;
  onDistrictChange: (district: string) => void;
  onWardChange: (ward: string) => void;
  onClear?: () => void;
  className?: string;
  width?: string;
  height?: string;
  selectWidth?: string;
  isFilter?: boolean;
}

export const CascadingLocationSelect: React.FC<CascadingLocationSelectProps> = ({
  province,
  district,
  ward,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onClear,
  className,
  width = 'w-full',
  height = 'h-10',
  selectWidth = 'flex-1',
  isFilter = false,
}) => {
  const [districts, setDistricts] = useState(getDistrictsByProvince(province || ''));
  const [wards, setWards] = useState(getWardsByDistrict(province || '', district || ''));

  // Update districts when province changes
  useEffect(() => {
    if (province) {
      const newDistricts = getDistrictsByProvince(province);
      setDistricts(newDistricts);
      // Clear district and ward when province changes
      if (district && !newDistricts.find(d => d.code === district)) {
        onDistrictChange('');
        onWardChange('');
      }
    } else {
      setDistricts([]);
    }
  }, [province, district, onDistrictChange, onWardChange]);

  // Update wards when district changes
  useEffect(() => {
    if (province && district) {
      const newWards = getWardsByDistrict(province, district);
      setWards(newWards);
      // Clear ward when district changes
      if (ward && !newWards.find(w => w.code === ward)) {
        onWardChange('');
      }
    } else {
      setWards([]);
    }
  }, [province, district, ward, onWardChange]);

  const handleProvinceChange = (value: string) => {
    onProvinceChange(value);
    onDistrictChange('');
    onWardChange('');
  };

  const handleDistrictChange = (value: string) => {
    onDistrictChange(value);
    onWardChange('');
  };

  return (
    <div className={`flex items-stretch gap-2 ${width} ${height} ${className}`}>
      <div className={`${selectWidth} min-w-0`}>
        <FloatingSelect
          label="Tỉnh/Thành phố"
          value={province || ''}
          onChange={handleProvinceChange}
          options={provinces.map((p) => ({
            value: p.code,
            label: p.name
          }))}
          height={height}
          isFilter={isFilter}
        />
      </div>

      <div className={`${selectWidth} min-w-0`}>
        <FloatingSelect
          label="Quận/Huyện"
          value={district || ''}
          onChange={handleDistrictChange}
          options={districts.map((d) => ({
            value: d.code,
            label: d.name
          }))}
          disabled={!province}
          height={height}
          isFilter={isFilter}
        />
      </div>

      <div className={`${selectWidth} min-w-0`}>
        <FloatingSelect
          label="Phường/Xã"
          value={ward || ''}
          onChange={onWardChange}
          options={wards.map((w) => ({
            value: w.code,
            label: w.name
          }))}
          disabled={!district}
          height={height}
          isFilter={isFilter}
        />
      </div>
    </div>
  );
};
