// Location data for Vietnam
export interface Location {
  code: string;
  name: string;
}

export interface Province extends Location {
  districts: District[];
}

export interface District extends Location {
  wards: Ward[];
}

export interface Ward extends Location {}

// Mock location data for Vietnam
export const provinces: Province[] = [
  {
    code: 'HN',
    name: 'Hà Nội',
    districts: [
      {
        code: 'BD',
        name: 'Quận Ba Đình',
        wards: [
          { code: 'PX', name: 'Phường Phúc Xá' },
          { code: 'TT', name: 'Phường Trúc Bạch' },
          { code: 'VH', name: 'Phường Vĩnh Phú' },
        ]
      },
      {
        code: 'HK',
        name: 'Quận Hoàn Kiếm',
        wards: [
          { code: 'CT', name: 'Phường Cửa Đông' },
          { code: 'HD', name: 'Phường Hàng Đào' },
          { code: 'HB', name: 'Phường Hàng Bồ' },
        ]
      }
    ]
  },
  {
    code: 'HCM',
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        code: 'Q1',
        name: 'Quận 1',
        wards: [
          { code: 'BN', name: 'Phường Bến Nghé' },
          { code: 'BT', name: 'Phường Bến Thành' },
          { code: 'CG', name: 'Phường Cầu Ông Lãnh' },
        ]
      },
      {
        code: 'Q3',
        name: 'Quận 3',
        wards: [
          { code: 'VH', name: 'Phường Võ Thị Sáu' },
          { code: 'NT', name: 'Phường Nguyễn Thị Minh Khai' },
          { code: 'LC', name: 'Phường Lê Văn Sỹ' },
        ]
      }
    ]
  },
  {
    code: 'DN',
    name: 'Đà Nẵng',
    districts: [
      {
        code: 'HL',
        name: 'Quận Hải Châu',
        wards: [
          { code: 'TH', name: 'Phường Thạch Thang' },
          { code: 'HP', name: 'Phường Hải Phong' },
          { code: 'HT', name: 'Phường Hải Tân' },
        ]
      }
    ]
  }
];

// Helper functions
export const getDistrictsByProvince = (provinceCode: string): District[] => {
  const province = provinces.find(p => p.code === provinceCode);
  return province?.districts || [];
};

export const getWardsByDistrict = (provinceCode: string, districtCode: string): Ward[] => {
  const province = provinces.find(p => p.code === provinceCode);
  const district = province?.districts.find(d => d.code === districtCode);
  return district?.wards || [];
};

export const getProvinceName = (provinceCode: string): string => {
  const province = provinces.find(p => p.code === provinceCode);
  return province?.name || '';
};

export const getDistrictName = (provinceCode: string, districtCode: string): string => {
  const province = provinces.find(p => p.code === provinceCode);
  const district = province?.districts.find(d => d.code === districtCode);
  return district?.name || '';
};

export const getWardName = (provinceCode: string, districtCode: string, wardCode: string): string => {
  const province = provinces.find(p => p.code === provinceCode);
  const district = province?.districts.find(d => d.code === districtCode);
  const ward = district?.wards.find(w => w.code === wardCode);
  return ward?.name || '';
};
