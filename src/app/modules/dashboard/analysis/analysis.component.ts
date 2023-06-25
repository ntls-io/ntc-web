import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RedeemComponent } from 'src/app/components/redeem/redeem.component';
import { AnalysisDigitalRight, AnalysisDigitalRightsQuery } from 'src/app/states/analysis-digital-rights';
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
  enableSellButton = false;
  digitalRights: AnalysisDigitalRight[] = [];

  constructor(
    private modalService: BsModalService,
    private analysisDigitalRightsQuery: AnalysisDigitalRightsQuery) {}
  
    ngOnInit(): void {
      this.digitalRights = this.analysisDigitalRightsQuery.getAll();
  }

  redeemDrt() {
    const initialState = {};
    this.modalService.show(RedeemComponent, { initialState });
  }

}
