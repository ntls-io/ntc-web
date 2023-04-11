import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  list = [
    { name: "Data Pool", amount: 1 },
    { name: "Digital Rights Tokens Sold", amount: 3 },
    { name: "Digital Rights Tokens Purchased", amount: 1 },
    { name: "Amount Paid Out", amount: "$20" }
  ];
  constructor() {}

  ngOnInit(): void {}
}
