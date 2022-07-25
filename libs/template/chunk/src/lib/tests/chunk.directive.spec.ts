import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ChunkModule } from '../chunk.module';

@Component({
  selector: 'chunk-test',
  template: `
    <div
      *rxChunk="
        strategy;
        renderCallback: renderCallback;
        suspenseTpl: withSuspense ? suspense : null
      "
    >
      chunked
    </div>
    <div>not-chunked</div>
    <ng-template #suspense>suspended</ng-template>
  `,
})
class ChunkTestComponent {
  strategy? = undefined;
  renderCallback = new Subject<void>();
  withSuspense = false;
}

describe('ChunkDirective', () => {
  let fixture: ComponentFixture<ChunkTestComponent>;
  let componentInstance: ChunkTestComponent;
  let nativeElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChunkModule],
      declarations: [ChunkTestComponent],
    });
    fixture = TestBed.createComponent(ChunkTestComponent);
    componentInstance = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
  });

  describe.each([
    [undefined] /* <- Invalid strategy should fallback. */,
    [''] /* <- Same here. */,
    ['invalid'] /* <- Same here. */,
    ['immediate'],
    ['userBlocking'],
    ['normal'],
    ['low'],
    ['idle'],
  ])('Stratgy: %s', (strategy: string) => {
    it('should render with given strategy', (done) => {
      componentInstance.strategy = strategy;
      componentInstance.renderCallback.subscribe(() => {
        try {
          expect(nativeElement.textContent.trim()).toBe('chunked not-chunked');
          done();
        } catch (e) {
          done(e.message);
        }
      });
      fixture.detectChanges();
      expect(nativeElement.textContent).toBe('not-chunked');
    });
    it('should render the suspense template sync', (done) => {
      componentInstance.strategy = strategy;
      componentInstance.withSuspense = true;
      componentInstance.renderCallback.subscribe(() => {
        try {
          expect(nativeElement.textContent.trim()).toBe('chunked not-chunked');
          done();
        } catch (e) {
          done(e.message);
        }
      });
      fixture.detectChanges();
      expect(nativeElement.textContent).toBe('suspendednot-chunked');
    });
  });
});
