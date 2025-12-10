import { Highlight } from './highlight';
import { TestBed } from '@angular/core/testing';
import { Renderer2, ElementRef } from '@angular/core';

describe('Highlight', () => {
  it('should create an instance', () => {
    const renderer = TestBed.inject(Renderer2);
    const elementRef = TestBed.inject(ElementRef);
    const directive = new Highlight(elementRef, renderer);
    expect(directive).toBeTruthy();
  });
});
