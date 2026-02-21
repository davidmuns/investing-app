import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HostListener } from '@angular/core';
import {
  CreatePortfolioRequest,
  PortfolioResponse,
  PortfolioService,
  PortfolioType,
} from '../../services/portfolio.service';

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

  // modal state
  modalOpen = false;
  form: CreatePortfolioRequest = { name: '', type: 'WATCHLIST' };
  formLoading = false;
  formError = '';
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.modalOpen) this.closeCreateModal();
  }

  constructor(private portfolioService: PortfolioService) { }

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

    this.portfolioService.delete(selected.id).subscribe({
      next: () => {
        this.reload();
      },
      error: () => {
        this.errorMsg = 'No se pudo eliminar la cartera.';
      },
    });
  }
}
