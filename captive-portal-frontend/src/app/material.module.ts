//Angular Module to include all Angular Material Modules
import { ModuleWithProviders, NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule} from '@angular/material/tabs';
import {MatTreeModule} from '@angular/material/tree';


import {
  ScrollingModule
} from '@angular/cdk/scrolling'
import { Scroll } from '@angular/router';
@NgModule({
  imports: [
  CommonModule, 
  MatToolbarModule,
  MatButtonModule, 
  MatCardModule,
  MatInputModule,
  MatDialogModule,
  MatTableModule,
  MatMenuModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatCheckboxModule,
  MatStepperModule,
  MatProgressBarModule,
  MatPaginatorModule,
  MatListModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatGridListModule,
  MatSlideToggleModule,
  MatTreeModule,
  ScrollingModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSidenavModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatRadioModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  ],
  exports: [
  CommonModule,
   MatToolbarModule, 
   MatButtonModule, 
   MatCardModule, 
   MatInputModule, 
   MatDialogModule, 
   MatTableModule, 
   MatMenuModule,
   MatIconModule,
   MatProgressSpinnerModule,
   MatCheckboxModule,
   MatStepperModule,
   MatProgressBarModule,
   MatPaginatorModule,
   MatListModule,
   MatSelectModule,
   MatSnackBarModule,
   MatTooltipModule,
   MatFormFieldModule,
   MatAutocompleteModule,
   MatGridListModule,
   MatSlideToggleModule,
   MatTreeModule,
   ScrollingModule,
   MatDatepickerModule,
   MatNativeDateModule,
   MatSidenavModule,
   MatExpansionModule,
   MatRadioModule,
   MatSortModule,
   MatTableModule,
   MatTabsModule
  ],
})
export class CustomMaterialModule { }