<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\SphereRepository")
 */
class Sphere
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="float")
     */
    private $radius;

    /**
     * @ORM\Column(type="integer")
     */
    private $widthSegments;

    /**
     * @ORM\Column(type="integer")
     */
    private $heightSegments;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRadius(): ?float
    {
        return $this->radius;
    }

    public function setRadius(float $radius): self
    {
        $this->radius = $radius;

        return $this;
    }

    public function getWidthSegments(): ?int
    {
        return $this->widthSegments;
    }

    public function setWidthSegments(int $widthSegments): self
    {
        $this->widthSegments = $widthSegments;

        return $this;
    }

    public function getHeightSegments(): ?int
    {
        return $this->heightSegments;
    }

    public function setHeightSegments(int $heightSegments): self
    {
        $this->heightSegments = $heightSegments;

        return $this;
    }
}
