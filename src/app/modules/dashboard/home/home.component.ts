import { Component, OnInit } from '@angular/core';
import { PoolData, PoolDataQuery, PoolDataService } from 'src/app/states/pool-data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  poolData!: PoolData[];
  list = [
    { name: 'Data Pool', amount: 1 },
    { name: 'Digital Rights Tokens Sold', amount: 3 },
    { name: 'Digital Rights Tokens Purchased', amount: 1 },
    { name: 'Amount Withdrawn', amount: '$20' }
  ];
  constructor(
    public poolDataService: PoolDataService,
    public poolDataQuery: PoolDataQuery
  ) {}

  ngOnInit(): void {
    this.poolDataService.fetchPoolData()
    this.poolData = this.poolDataService.merge_data;
  }
}
