<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\EnvironnementRepository")
 */
class Environnement
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=7)
     */
    private $water;

    /**
     * @ORM\Column(type="string", length=7)
     */
    private $ground;

    /**
     * @ORM\Column(type="string", length=7)
     */
    private $highTerran;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getWater(): ?string
    {
        return $this->water;
    }

    public function setWater(string $water): self
    {
        $this->water = $water;

        return $this;
    }

    public function getGround(): ?string
    {
        return $this->ground;
    }

    public function setGround(string $ground): self
    {
        $this->ground = $ground;

        return $this;
    }

    public function getHighTerran(): ?string
    {
        return $this->highTerran;
    }

    public function setHighTerran(string $highTerran): self
    {
        $this->highTerran = $highTerran;

        return $this;
    }
}
