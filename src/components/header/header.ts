import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';

interface City {
  id: string;
  name: string;
}

@Component({
  selector: 'tmf-header',
  imports: [MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // 城市 Mock Data
  cities: City[] = [
    { id: 'all', name: '探索全部' },
    { id: 'taipei', name: '台北市' },
    { id: 'taoyuan', name: '桃園市' },
    { id: 'tainan', name: '台南市' },
    { id: 'kaohsiung', name: '高雄市' },
    { id: 'new-taipei', name: '新北市' },
    { id: 'taichung', name: '台中市' },
    { id: 'hsinchu', name: '新竹市' },
    { id: 'chiayi', name: '嘉義市' },
    { id: 'keelung', name: '基隆市' },
    { id: 'hualien', name: '花蓮縣' },
    { id: 'taitung', name: '台東縣' }
  ];

  selectedCity = signal<string>('探索全部');

  get TmfIconEnum() {
    return TmfIconEnum;
  }

  selectCity(city: City): void {
    this.selectedCity.set(city.name);
  }
}
