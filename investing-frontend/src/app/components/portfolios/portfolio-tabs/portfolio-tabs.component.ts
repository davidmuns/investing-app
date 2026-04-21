import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';

@Component({
  selector: 'app-portfolio-tabs',
  templateUrl: './portfolio-tabs.component.html',
  styleUrls: ['./portfolio-tabs.component.css'],
})
export class PortfolioTabsComponent implements AfterViewChecked {
  @Input() portfolios: PortfolioResponse[] = [];
  @Input() selectedIndex = 0;
  @Input() editingIndex: number | null = null;
  @Input() editName = '';
  @Input() watchlistType = '';

  @Output() addPortfolio = new EventEmitter<void>();
  @Output() dropTab = new EventEmitter<CdkDragDrop<PortfolioResponse[]>>();
  @Output() editNameChange = new EventEmitter<string>();
  @Output() saveEdit = new EventEmitter<number>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() selectPortfolioTab = new EventEmitter<number>();
  @Output() startEdit = new EventEmitter<number>();

  @ViewChildren('editInput') private editInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private focusedEditIndex: number | null = null;

  ngAfterViewChecked(): void {
    if (this.editingIndex === null || this.focusedEditIndex === this.editingIndex) {
      return;
    }

    const el = this.editInputs.first?.nativeElement;
    if (!el) {
      return;
    }

    el.focus();
    el.select();
    this.focusedEditIndex = this.editingIndex;
  }

  onEditNameChange(value: string): void {
    this.editNameChange.emit(value);
  }

  onStartEdit(index: number): void {
    this.focusedEditIndex = null;
    this.startEdit.emit(index);
  }

  onCancelEdit(): void {
    this.focusedEditIndex = null;
    this.cancelEdit.emit();
  }

  onSaveEdit(index: number): void {
    this.focusedEditIndex = null;
    this.saveEdit.emit(index);
  }

  onDropTab(event: CdkDragDrop<PortfolioResponse[]>): void {
    this.dropTab.emit(event);
  }

  trackByPortfolio = (_: number, portfolio: PortfolioResponse): number | string =>
    portfolio.id ?? portfolio.name;
}
