import React, { useState, useEffect } from 'react';
import { Select } from './Select';
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
}

export const CascadingLocationSelect: React.FC<CascadingLocationSelectProps> = ({
  province,
  district,
  ward,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onClear,
  className
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
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành phố
        </label>
        <Select
          value={province || ''}
          onValueChange={handleProvinceChange}
          placeholder="Chọn tỉnh/thành phố"
        >
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quận/Huyện
        </label>
        <Select
          value={district || ''}
          onValueChange={handleDistrictChange}
          placeholder="Chọn quận/huyện"
          disabled={!province}
        >
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phường/Xã
        </label>
        <Select
          value={ward || ''}
          onValueChange={onWardChange}
          placeholder="Chọn phường/xã"
          disabled={!district}
        >
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
