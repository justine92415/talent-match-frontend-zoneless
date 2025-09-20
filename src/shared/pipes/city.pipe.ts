import { Pipe, PipeTransform } from '@angular/core';
import { Cities } from '@share/cities';

@Pipe({
  name: 'city',
  standalone: true,
  pure: true
})
export class CityPipe implements PipeTransform {
  transform(cityId: number): string {
    if (!cityId) return '';

    // 根據 cities.ts 結構建立 ID 對應
    // 假設 cityId 對應到 Cities 陣列的索引 + 1
    const cityIndex = cityId - 1;

    if (cityIndex >= 0 && cityIndex < Cities.length) {
      return Cities[cityIndex].name;
    }

    return '';
  }
}