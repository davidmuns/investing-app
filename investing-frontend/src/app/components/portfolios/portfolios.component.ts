import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { HostListener } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { PortfolioRequest, PortfolioType } from '@app/shared/models/portfolios-request';
type ApiError = { error?: string; message?: string };

@Component({
  selector: 'app-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.css'],
})
export class PortfoliosComponent implements OnInit {
  portfolios: PortfolioResponse[] = [];
  selectedIndex = 0;
  loading = false;
  errorMsg = '';
  editingIndex: number | null = null;
  editName = '';
  symbolQuery = '';
  symbolError = '';
  actionsOpen = false;
  trackByPortfolio = (_: number, p: any) => p.id ?? p.name;

  // modal state
  modalOpen = false;
  form: PortfolioRequest = { name: '', type: 'WATCHLIST' };
  formLoading = false;
  formError = '';
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef<HTMLInputElement>>;

  toggleActions(): void {
    this.actionsOpen = !this.actionsOpen;
  }

  closeActions(): void {
    this.actionsOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeActions();
    if (this.actionsOpen) this.closeActions();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.modalOpen) this.closeCreateModal();
  }

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.errorMsg = '';

    this.portfolioService.list().subscribe({
      next: (data) => {
        this.portfolios = data;
        this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, this.portfolios.length - 1));
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar las carteras.';
        this.loading = false;
      },
    });
  }

  openCreateModal(): void {
    this.form = { name: '', type: 'WATCHLIST' };
    this.formError = '';
    this.modalOpen = true;
    setTimeout(() => this.nameInput?.nativeElement.focus(), 0);
  }

  closeCreateModal(): void {
    if (this.formLoading) return;
    this.modalOpen = false;
  }

  setType(type: PortfolioType): void {
    this.form.type = type;
  }

  createPortfolio(): void {
    const name = this.form.name.trim();
    if (!name) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }

    this.formLoading = true;
    this.formError = '';

    this.portfolioService.create({ name, type: this.form.type }).subscribe({
      next: (created) => {
        this.formLoading = false;
        this.modalOpen = false;

        // recargar y seleccionar la creada
        this.portfolioService.list().subscribe({
          next: (data) => {
            this.portfolios = data;
            const idx = this.portfolios.findIndex((p) => p.id === created.id);
            this.selectedIndex = idx >= 0 ? idx : 0;
          },
          error: () => {
            this.errorMsg = 'Cartera creada, pero no se pudo recargar la lista.';
          },
        });
      },
      error: (err) => {
        this.formLoading = false;

        if (err?.status === 409) {
          const apiErr: ApiError = err?.error ?? {};
          this.formError = apiErr.message || 'Cartera duplicada.';
          return;
        }

        this.formError = 'No se pudo crear la cartera.';
      },
    });
  }

  deleteSelected(): void {
    const selected = this.portfolios[this.selectedIndex];
    if (!selected) return;

    const ok = confirm(`¿Eliminar la cartera "${selected.name}"?`);
    if (!ok) return;

    const deletingId = selected.id;

    this.portfolioService.delete(deletingId).subscribe({
      next: () => {
        const deletedIndex = this.portfolios.findIndex((p) => p.id === deletingId);
        this.portfolios = this.portfolios.filter((p) => p.id !== deletingId);

        if (this.portfolios.length === 0) {
          this.selectedIndex = 0;
          return;
        }

        // Mantener “posición” si existe; si borraste la última, selecciona la nueva última
        this.selectedIndex = Math.min(this.selectedIndex, this.portfolios.length - 1);

        // Si borraste una tab anterior a la seleccionada, desplaza el índice
        if (deletedIndex >= 0 && deletedIndex < this.selectedIndex) {
          this.selectedIndex = this.selectedIndex - 1;
        }
      },
      error: () => {
        this.errorMsg = 'No se pudo eliminar la cartera.';
      },
    });
  }

  closeEditIfOpen() {
    if (this.editingIndex !== null) {
      this.saveEdit(this.editingIndex);
    }
  }

  selectTab(i: number) {
    // si estás editando otra pestaña, guarda (o cancela) antes
    if (this.editingIndex !== null && this.editingIndex !== i) {
      this.saveEdit(this.editingIndex);
    }
    this.selectedIndex = i;
  }

  startEdit(i: number) {
    this.editingIndex = i;
    this.editName = this.portfolios[i].name;

    setTimeout(() => {
      // Como solo habrá 1 input visible, cogemos el primero
      const el = this.editInputs.first?.nativeElement;
      el?.focus();
      el?.select();
    });
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editName = '';
  }

  saveEdit(index: number) {
    const portfolio = this.portfolios[index];
    const newName = this.editName.trim();

    if (!newName || newName === portfolio.name) {
      this.cancelEdit();
      return;
    }

    this.portfolioService.rename(portfolio.id, newName).subscribe({
      next: (updated) => {
        this.portfolios[index] = updated;
        this.cancelEdit();
      },
      error: () => {
        alert('No se pudo renombrar la cartera.');
        this.cancelEdit();
      },
    });
  }

  submitSymbol(): void {
    const q = this.symbolQuery.trim();
    if (!q) {
      this.symbolError = 'Introduce un símbolo o búsqueda.';
      return;
    }
    this.symbolError = '';
    console.log('ADD SYMBOL =>', {
      portfolioId: this.portfolios[this.selectedIndex]?.id,
      query: q,
    });

    // Por ahora solo limpiamos el input
    this.symbolQuery = '';
  }

  dropTab(event: CdkDragDrop<any>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.portfolios, event.previousIndex, event.currentIndex);

    // Ajuste del selectedIndex para que no “salte” a otra pestaña
    if (this.selectedIndex === event.previousIndex) {
      this.selectedIndex = event.currentIndex;
    } else if (this.selectedIndex > event.previousIndex && this.selectedIndex <= event.currentIndex) {
      this.selectedIndex--;
    } else if (this.selectedIndex < event.previousIndex && this.selectedIndex >= event.currentIndex) {
      this.selectedIndex++;
    }

    // (Opcional) Persistir orden:
    // this.saveOrder(this.portfolios.map(p => p.id));
  }
}
